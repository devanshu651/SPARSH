from datetime import datetime, timezone
import hashlib

from fastapi import APIRouter, Depends, HTTPException, status
from firebase_admin import firestore
from google.api_core.exceptions import AlreadyExists
from app.core.firebase import get_firestore_client
from app.core.audit import audit_log
from app.core.security import ensure_centre_access, require_roles
from app.models.auth import CurrentUser, Role
from app.models.screening import ChildHistoryResponse, RiskScoreResponse, ScreeningHistoryItem, ScreeningSubmit
from app.ml.features import extract_features
from app.ml.predictor import UnavailablePredictor
from app.routers.children import child_from_snapshot, age_months
from app.services.milestone_service import (
    age_band_for_screening,
    load_milestone_config,
    milestones_by_id,
    milestones_for_age,
    validate_checkpoint_answers,
)
from app.services.scoring_engine import calculate_risk
router = APIRouter(tags=["screenings"])


def history_item_from_data(screening_id: str, data: dict, current_version: str, current_catalog: dict) -> ScreeningHistoryItem:
    snapshot = data.get("milestone_snapshot") or []
    if not snapshot and data.get("milestone_dataset_version") == current_version:
        snapshot = [{"id": answer["milestone_id"], "domain": current_catalog[answer["milestone_id"]]["domain"], "text": current_catalog[answer["milestone_id"]].get("question", current_catalog[answer["milestone_id"]].get("description", ""))} for answer in data.get("answers", []) if answer.get("milestone_id") in current_catalog]
    missed_ids = {answer["milestone_id"] for answer in data.get("answers", []) if answer.get("response") == "NO"}
    missed_milestones = [{key: item[key] for key in ("id", "domain", "text") if key in item} for item in snapshot if item.get("id") in missed_ids]
    return ScreeningHistoryItem(screening_id=screening_id, screened_at=data["screened_at"], risk_level=data["risk_level"], total_missed_weight=data["total_missed_weight"], checkpoint_age_months=data.get("checkpoint_age_months"), domain_scores=data.get("domain_scores", {}), answers=data.get("answers", []), red_flag_ids=data.get("red_flag_ids", []), risk_factor_ids=data.get("risk_factor_ids", []), milestone_dataset_version=data.get("milestone_dataset_version"), missed_milestones=missed_milestones)


@router.get("/milestones")
def get_milestones(age_months: int, user: CurrentUser = Depends(require_roles(Role.WORKER, Role.SUPERVISOR))):
    checkpoint, milestones = milestones_for_age(age_months)
    band = age_band_for_screening(age_months) if age_months >= 2 else None
    all_domains = {"gross_motor", "fine_motor", "language", "cognitive", "social_emotional"}
    assessed_domains = {item["domain"] for item in milestones}
    target_count = band["target_count"] if band else 0
    return {
        "dataset_version": load_milestone_config()["version"],
        "requested_age_months": age_months,
        "checkpoint_age_months": checkpoint,
        "question_count": len(milestones),
        "age_band": {"min_months": band["min_m"], "max_months": band["max_m"], "label": band["label"]} if band else None,
        "coverage": {
            "target_question_count": target_count,
            "shortfall": max(0, target_count - len(milestones)),
            "missing_domains": sorted(all_domains - assessed_domains),
        },
        "milestones": milestones,
    }
@router.post("/screenings", response_model=RiskScoreResponse, status_code=status.HTTP_201_CREATED)
def submit_screening(payload: ScreeningSubmit, user: CurrentUser = Depends(require_roles(Role.WORKER))):
    db = get_firestore_client(); child = child_from_snapshot(db.collection("children").document(payload.child_id).get()); ensure_centre_access(user, child["centre_id"])
    current_age = age_months(child["date_of_birth"])
    expected_age, expected = milestones_for_age(current_age)
    dataset_version = load_milestone_config()["version"]
    if payload.checkpoint_age_months != expected_age or payload.milestone_dataset_version != dataset_version:
        raise HTTPException(status_code=409, detail={"code": "screening_checkpoint_changed", "message": "The child's screening checkpoint has changed. Reload the screening to use the current questions.", "current_age_months": current_age, "checkpoint_age_months": expected_age, "dataset_version": dataset_version})
    milestones = milestones_by_id()
    submitted_ids = [item.milestone_id for item in payload.answers]
    try:
        validate_checkpoint_answers(expected, submitted_ids)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    existing = list(db.collection("screenings").where("client_submission_id", "==", payload.client_submission_id).limit(1).stream())
    if existing:
        raise HTTPException(status_code=409, detail={"code": "duplicate_submission", "message": "This screening was already submitted. Open the child's history to view it."})
    answer_data = [item.model_dump(mode="json") for item in payload.answers]; result = calculate_risk(answer_data, milestones)
    previous_screenings = [doc.to_dict() for doc in db.collection("screenings").where("child_id", "==", payload.child_id).stream()]
    features = extract_features(
        checkpoint_age_months=expected_age,
        milestone_dataset_version=dataset_version,
        answers=answer_data,
        milestones=milestones,
        domain_scores=result["domain_scores"],
        red_flag_ids=result.get("red_flag_ids", []),
        risk_factor_ids=result.get("risk_factor_ids", []),
        previous_screenings=previous_screenings,
    )
    ml_assessment = UnavailablePredictor().predict(features).model_dump(mode="json")
    now = datetime.now(timezone.utc)
    serialized = {
        key: ({domain: score.model_dump(mode="json") for domain, score in value.items()} if key == "domain_scores" else value.value if hasattr(value, "value") else value)
        for key, value in result.items()
    }
    milestone_snapshot = [{"id": item["id"], "domain": item.get("domain", "unknown"), "text": item.get("question", item.get("description", "")), "age": item.get("age_metadata")} for item in expected]
    screening = payload.model_dump(mode="json") | {"answers": answer_data, "milestone_snapshot": milestone_snapshot, **serialized, "checkpoint_age_months": expected_age, "milestone_dataset_version": dataset_version, "created_by": user.uid, "created_at": now, "ml_assessment": ml_assessment}
    ref = db.collection("screenings").document()
    submission_ref = db.collection("screening_submissions").document(
        hashlib.sha256(payload.client_submission_id.encode("utf-8")).hexdigest()
    )
    transaction = db.transaction()

    @firestore.transactional
    def write_submission(transaction):
        if submission_ref.get(transaction=transaction).exists:
            raise HTTPException(status_code=409, detail={"code": "duplicate_submission", "message": "This screening was already submitted. Open the child's history to view it."})
        transaction.create(submission_ref, {"screening_id": ref.id})
        transaction.set(ref, screening)

    try:
        write_submission(transaction)
    except AlreadyExists as exc:
        raise HTTPException(status_code=409, detail={"code": "duplicate_submission", "message": "This screening was already submitted. Open the child's history to view it."}) from exc
    audit_log(user.uid, "screening_submitted", ref.id, child["centre_id"])
    return RiskScoreResponse(screening_id=ref.id, child_id=payload.child_id, screened_at=payload.screened_at, ml_assessment=screening["ml_assessment"], **result, milestone_dataset_version=screening["milestone_dataset_version"])
@router.get("/screenings/{screening_id}/risk", response_model=RiskScoreResponse)
def get_risk_score(screening_id: str, user: CurrentUser = Depends(require_roles(Role.WORKER, Role.SUPERVISOR))):
    data = get_firestore_client().collection("screenings").document(screening_id).get().to_dict()
    if not data: raise HTTPException(status_code=404, detail="Screening not found")
    child = child_from_snapshot(get_firestore_client().collection("children").document(data["child_id"]).get()); ensure_centre_access(user, child["centre_id"])
    return RiskScoreResponse(screening_id=screening_id, child_id=data["child_id"], risk_level=data["risk_level"], risk_label=data["risk_label"], total_missed_weight=data["total_missed_weight"], domain_scores=data["domain_scores"], recommendation=data["recommendation"], milestone_dataset_version=data["milestone_dataset_version"], screened_at=data["screened_at"], rule_findings=data.get("rule_findings", []), red_flag_ids=data.get("red_flag_ids", []), risk_factor_ids=data.get("risk_factor_ids", []), ml_assessment=data.get("ml_assessment", {"status": "unavailable", "reason": "No validated model is configured."}), prototype=data.get("prototype", False), clinical_validation=data.get("clinical_validation", False), review_status=data.get("review_status"))
@router.get("/children/{child_id}/history", response_model=ChildHistoryResponse)
def child_history(child_id: str, user: CurrentUser = Depends(require_roles(Role.WORKER, Role.SUPERVISOR))):
    db=get_firestore_client(); child=child_from_snapshot(db.collection("children").document(child_id).get()); ensure_centre_access(user, child["centre_id"])
    docs=db.collection("screenings").where("child_id", "==", child_id).stream()
    entries=[]
    current_config = load_milestone_config()
    current_catalog = milestones_by_id()
    for doc in docs:
        data=doc.to_dict()
        entries.append(history_item_from_data(doc.id, data, current_config.get("version"), current_catalog))
    return ChildHistoryResponse(child_id=child_id, screenings=sorted(entries, key=lambda entry: entry.screened_at))

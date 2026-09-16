from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.firebase import get_firestore_client
from app.core.security import ensure_centre_access, get_current_user, require_roles
from app.models.auth import CurrentUser, Role
from app.models.screening import ChildHistoryResponse, RiskScoreResponse, ScreeningHistoryItem, ScreeningSubmit
from app.routers.children import child_from_snapshot, age_months
from app.services.milestone_service import load_milestone_config, milestones_by_id, milestones_for_age, validate_checkpoint_answers
from app.services.scoring_engine import calculate_risk
router = APIRouter(tags=["screenings"])
@router.get("/milestones")
def get_milestones(age_months: int, user: CurrentUser = Depends(get_current_user)):
    checkpoint, milestones = milestones_for_age(age_months)
    return {"dataset_version": load_milestone_config()["version"], "requested_age_months": age_months, "checkpoint_age_months": checkpoint, "milestones": milestones}
@router.post("/screenings", response_model=RiskScoreResponse, status_code=status.HTTP_201_CREATED)
def submit_screening(payload: ScreeningSubmit, user: CurrentUser = Depends(require_roles(Role.WORKER, Role.ADMIN))):
    db = get_firestore_client(); child = child_from_snapshot(db.collection("children").document(payload.child_id).get()); ensure_centre_access(user, child["centre_id"])
    current_age = age_months(child["date_of_birth"])
    expected_age, expected = milestones_for_age(current_age)
    dataset_version = load_milestone_config()["version"]
    if payload.checkpoint_age_months != expected_age or payload.milestone_dataset_version != dataset_version:
        raise HTTPException(status_code=409, detail={"message": "The child's screening checkpoint has changed. Reload the screening to use the current questions.", "current_age_months": current_age, "checkpoint_age_months": expected_age, "dataset_version": dataset_version})
    milestones = milestones_by_id()
    submitted_ids = [item.milestone_id for item in payload.answers]
    try:
        validate_checkpoint_answers(expected, submitted_ids)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    existing = list(db.collection("screenings").where("client_submission_id", "==", payload.client_submission_id).stream())
    if existing:
        raise HTTPException(status_code=409, detail="This screening was already submitted. Open the child's history to view it.")
    answer_data = [item.model_dump(mode="json") for item in payload.answers]; result = calculate_risk(answer_data, milestones)
    now = datetime.now(timezone.utc); screening = payload.model_dump(mode="json") | {"answers": answer_data, **{key: (value.model_dump() if key == "domain_scores" else value.value if hasattr(value, "value") else value) for key,value in result.items()}, "checkpoint_age_months": expected_age, "milestone_dataset_version": dataset_version, "created_by": user.uid, "created_at": now}
    ref = db.collection("screenings").document(); db.collection("screenings").document(ref.id).set(screening)
    return RiskScoreResponse(screening_id=ref.id, child_id=payload.child_id, screened_at=payload.screened_at, **result, milestone_dataset_version=screening["milestone_dataset_version"])
@router.get("/screenings/{screening_id}/risk", response_model=RiskScoreResponse)
def get_risk_score(screening_id: str, user: CurrentUser = Depends(get_current_user)):
    data = get_firestore_client().collection("screenings").document(screening_id).get().to_dict()
    if not data: raise HTTPException(status_code=404, detail="Screening not found")
    child = child_from_snapshot(get_firestore_client().collection("children").document(data["child_id"]).get()); ensure_centre_access(user, child["centre_id"])
    return RiskScoreResponse(screening_id=screening_id, child_id=data["child_id"], risk_level=data["risk_level"], risk_label=data["risk_label"], total_missed_weight=data["total_missed_weight"], domain_scores=data["domain_scores"], recommendation=data["recommendation"], milestone_dataset_version=data["milestone_dataset_version"], screened_at=data["screened_at"])
@router.get("/children/{child_id}/history", response_model=ChildHistoryResponse)
def child_history(child_id: str, user: CurrentUser = Depends(get_current_user)):
    db=get_firestore_client(); child=child_from_snapshot(db.collection("children").document(child_id).get()); ensure_centre_access(user, child["centre_id"])
    docs=db.collection("screenings").where("child_id", "==", child_id).stream(); entries=[ScreeningHistoryItem(screening_id=doc.id, screened_at=doc.to_dict()["screened_at"], risk_level=doc.to_dict()["risk_level"], total_missed_weight=doc.to_dict()["total_missed_weight"]) for doc in docs]
    return ChildHistoryResponse(child_id=child_id, screenings=sorted(entries, key=lambda entry: entry.screened_at))

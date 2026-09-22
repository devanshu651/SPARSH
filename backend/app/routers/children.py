from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from firebase_admin import firestore

from app.core.firebase import get_firestore_client
from app.core.audit import audit_log
from app.core.security import ensure_centre_access, get_current_user, require_roles
from app.models.auth import CurrentUser, Role
from app.models.child import ChildCreate, ChildResponse, HealthDataCreate, HealthDataResponse
from app.routers.centres import centre_from_snapshot
from app.services.milestone_service import load_milestone_config, milestones_for_age


router = APIRouter(prefix="/children", tags=["children"])


def age_months(dob: date) -> int:
    today = date.today()
    return max(0, (today.year - dob.year) * 12 + today.month - dob.month - (today.day < dob.day))


def child_from_snapshot(snapshot) -> dict:
    data = snapshot.to_dict()
    if not data:
        raise HTTPException(status_code=404, detail="Child not found")
    data["id"] = snapshot.id
    return data


def _register_child_in_transaction(db, payload: ChildCreate, user: CurrentUser) -> tuple[str, dict]:
    centre_ref = db.collection("centres").document(payload.centre_id)
    child_ref = db.collection("children").document()
    transaction = db.transaction()

    @firestore.transactional
    def create(transaction):
        centre_snapshot = centre_ref.get(transaction=transaction)
        centre = centre_from_snapshot(centre_snapshot)
        if not centre.get("active", False):
            raise HTTPException(status_code=409, detail="Centre is inactive")
        data = payload.model_dump() | {
            "centre_name": centre["name"],
            "age_months": age_months(payload.date_of_birth),
            "created_at": datetime.now(timezone.utc),
            "created_by": user.uid,
        }
        transaction.set(child_ref, data)
        return data

    return child_ref.id, create(transaction)


@router.post("", response_model=ChildResponse, status_code=status.HTTP_201_CREATED)
def register_child(payload: ChildCreate, user: CurrentUser = Depends(require_roles(Role.WORKER, Role.ADMIN))):
    ensure_centre_access(user, payload.centre_id)
    child_id, data = _register_child_in_transaction(get_firestore_client(), payload, user)
    audit_log(user.uid, "child_created", child_id, payload.centre_id)
    return ChildResponse(id=child_id, **data)


@router.get("", response_model=list[ChildResponse])
def list_children(user: CurrentUser = Depends(get_current_user)):
    """Return only records visible to the signed-in worker or administrator."""
    children = []
    for doc in get_firestore_client().collection("children").stream():
        data = doc.to_dict()
        if user.role is Role.ADMIN or data.get("centre_id") in user.centre_ids:
            screenings = list(get_firestore_client().collection("screenings").where("child_id", "==", doc.id).stream())
            if screenings:
                latest = max((item.to_dict() for item in screenings), key=lambda item: item.get("screened_at"))
                data["latest_risk"] = latest.get("risk_level")
            children.append(ChildResponse(id=doc.id, **data))
    return sorted(children, key=lambda child: child.created_at, reverse=True)


@router.get("/{child_id}/milestones")
def child_milestones(child_id: str, user: CurrentUser = Depends(get_current_user)):
    child = child_from_snapshot(get_firestore_client().collection("children").document(child_id).get())
    ensure_centre_access(user, child["centre_id"])
    current_age = age_months(child["date_of_birth"])
    checkpoint, milestones = milestones_for_age(current_age)
    return {
        "dataset_version": load_milestone_config()["version"],
        "current_age_months": current_age,
        "checkpoint_age_months": checkpoint,
        "milestones": milestones,
    }


@router.get("/{child_id}", response_model=ChildResponse)
def get_child(child_id: str, user: CurrentUser = Depends(get_current_user)):
    child = child_from_snapshot(get_firestore_client().collection("children").document(child_id).get())
    ensure_centre_access(user, child["centre_id"])
    return ChildResponse(**child)


@router.post("/{child_id}/health-data", response_model=HealthDataResponse, status_code=status.HTTP_201_CREATED)
def record_health_data(child_id: str, payload: HealthDataCreate, user: CurrentUser = Depends(require_roles(Role.WORKER, Role.ADMIN))):
    child = child_from_snapshot(get_firestore_client().collection("children").document(child_id).get())
    ensure_centre_access(user, child["centre_id"])
    data = payload.model_dump() | {"child_id": child_id, "recorded_by": user.uid, "created_at": datetime.now(timezone.utc)}
    ref = get_firestore_client().collection("children").document(child_id).collection("health_data").document()
    ref.set(data)
    audit_log(user.uid, "health_data_created", child_id, child["centre_id"])
    return HealthDataResponse(id=ref.id, **data)


@router.get("/{child_id}/health-data", response_model=list[HealthDataResponse])
def health_history(child_id: str, user: CurrentUser = Depends(get_current_user)):
    child = child_from_snapshot(get_firestore_client().collection("children").document(child_id).get())
    ensure_centre_access(user, child["centre_id"])
    docs = get_firestore_client().collection("children").document(child_id).collection("health_data").order_by("measured_on").stream()
    return [HealthDataResponse(id=doc.id, **doc.to_dict()) for doc in docs]

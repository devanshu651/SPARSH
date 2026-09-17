from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from firebase_admin import firestore

from app.core.firebase import get_firestore_client
from app.core.security import ensure_centre_access, get_current_user, require_roles
from app.models.auth import CurrentUser, Role
from app.models.centre import CentreCreate, CentreResponse, CentreUpdate


router = APIRouter(prefix="/centres", tags=["centres"])


def centre_from_snapshot(snapshot) -> dict:
    data = snapshot.to_dict()
    if not data:
        raise HTTPException(status_code=404, detail="Centre not found")
    return {"id": snapshot.id, **data}


def get_active_centre(centre_id: str) -> dict:
    centre = centre_from_snapshot(get_firestore_client().collection("centres").document(centre_id).get())
    if not centre["active"]:
        raise HTTPException(status_code=409, detail="Centre is inactive")
    return centre


def _create_centre_in_transaction(db, data: dict) -> str:
    """Reserve the normalized code and create its centre in one transaction."""
    centre_ref = db.collection("centres").document()
    code_ref = db.collection("centre_codes").document(data["code"])
    transaction = db.transaction()

    @firestore.transactional
    def create(transaction):
        if code_ref.get(transaction=transaction).exists:
            raise HTTPException(status_code=409, detail="A centre with this code already exists")
        transaction.set(code_ref, {"centre_id": centre_ref.id})
        transaction.set(centre_ref, data)

    create(transaction)
    return centre_ref.id


@router.post("", response_model=CentreResponse, status_code=status.HTTP_201_CREATED)
def create_centre(payload: CentreCreate, user: CurrentUser = Depends(require_roles(Role.ADMIN))):
    data = payload.model_dump() | {
        "active": True,
        "created_at": datetime.now(timezone.utc),
        "created_by": user.uid,
    }
    centre_id = _create_centre_in_transaction(get_firestore_client(), data)
    return CentreResponse(id=centre_id, **data)


@router.get("", response_model=list[CentreResponse])
def list_centres(user: CurrentUser = Depends(get_current_user)):
    centres = []
    for snapshot in get_firestore_client().collection("centres").stream():
        centre = centre_from_snapshot(snapshot)
        if user.role is Role.ADMIN or centre["id"] in user.centre_ids:
            centres.append(CentreResponse(**centre))
    return sorted(centres, key=lambda centre: (centre.name.casefold(), centre.code))


@router.get("/{centre_id}", response_model=CentreResponse)
def get_centre(centre_id: str, user: CurrentUser = Depends(get_current_user)):
    ensure_centre_access(user, centre_id)
    return CentreResponse(**centre_from_snapshot(get_firestore_client().collection("centres").document(centre_id).get()))


@router.patch("/{centre_id}", response_model=CentreResponse)
def update_centre(centre_id: str, payload: CentreUpdate, user: CurrentUser = Depends(require_roles(Role.ADMIN))):
    db = get_firestore_client()
    centre_from_snapshot(db.collection("centres").document(centre_id).get())
    updates = payload.model_dump(exclude_unset=True)
    db.collection("centres").document(centre_id).update(updates)
    return CentreResponse(**centre_from_snapshot(db.collection("centres").document(centre_id).get()))

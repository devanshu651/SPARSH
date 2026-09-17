from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from firebase_admin import auth, firestore

from app.core.firebase import get_firestore_client
from app.core.security import get_current_user, require_roles
from app.models.auth import (
    CurrentUser,
    Role,
    UserActivationUpdate,
    UserProvision,
    UserResponse,
    UserUpdate,
)


router = APIRouter(prefix="/users", tags=["users"])


def _profile_from_snapshot(snapshot) -> dict:
    profile = snapshot.to_dict()
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    return {"uid": snapshot.id, **profile}


def _user_response(profile: dict, firebase_user) -> UserResponse:
    return UserResponse(
        uid=profile["uid"],
        name=profile["name"],
        role=profile["role"],
        centre_ids=profile.get("centre_ids", []),
        disabled=bool(firebase_user.disabled),
        created_at=profile.get("created_at"),
    )


def _write_profile_with_active_centres(db, uid: str, profile: dict, *, create: bool) -> dict:
    """Atomically verify centre state and write the corresponding profile."""
    profile_ref = db.collection("users").document(uid)
    transaction = db.transaction()

    @firestore.transactional
    def write(transaction):
        for centre_id in profile.get("centre_ids", []):
            centre = db.collection("centres").document(centre_id).get(transaction=transaction).to_dict()
            if not centre:
                raise HTTPException(status_code=422, detail=f"Centre not found: {centre_id}")
            if not centre.get("active", False):
                raise HTTPException(status_code=409, detail=f"Centre is inactive: {centre_id}")

        if create:
            transaction.set(profile_ref, profile)
            return profile

        current = profile_ref.get(transaction=transaction).to_dict()
        if not current:
            raise HTTPException(status_code=404, detail="User profile not found")
        transaction.update(profile_ref, profile)
        return current | profile

    return write(transaction)


def _verify_auth_account_exists(uid: str) -> None:
    """Verify Firebase Auth account exists; raise 404 if not found."""
    try:
        auth.get_user(uid)
    except auth.UserNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Authentication account not found") from exc
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Authentication account not found") from exc


def _validate_centre_existence(db, centre_ids: list[str]) -> None:
    """Fail-fast check that centres exist (non-existence is immutable; active state can change)."""
    for centre_id in centre_ids:
        snapshot = db.collection("centres").document(centre_id).get()
        if snapshot.to_dict() is None:
            raise HTTPException(status_code=422, detail=f"Centre not found: {centre_id}")


def _validate_centre_active(db, centre_ids: list[str]) -> None:
    """Fail-fast check that centres are active; transactional check remains authoritative for race conditions."""
    for centre_id in centre_ids:
        snapshot = db.collection("centres").document(centre_id).get()
        centre = snapshot.to_dict()
        if centre is None:
            raise HTTPException(status_code=422, detail=f"Centre not found: {centre_id}")
        if not centre.get("active", False):
            raise HTTPException(status_code=409, detail=f"Centre is inactive: {centre_id}")


def _ensure_not_removing_last_active_admin(db, uid: str, current_profile: dict, *, disabling: bool = False, new_role: Role | None = None) -> None:
    """Reject removal of the sole enabled Firebase account with an admin profile.

    This check reads Firestore admin profiles transactionally and verifies their
    Firebase Auth disabled state. Because Firebase Auth state cannot participate
    in a Firestore transaction, there is a fundamental race condition: another
    admin could be disabled between this check and the actual Firebase Auth update.
    The guard document write forces concurrent transactions to re-read the admin
    set, but this is a best-effort mitigation. Operations that would remove the
    last active admin are rejected with HTTP 409.
    """
    if current_profile.get("role") != Role.ADMIN.value:
        return
    if not disabling and (new_role is None or new_role is Role.ADMIN):
        return

    transaction = db.transaction()

    @firestore.transactional
    def check(transaction):
        profiles = transaction.get(db.collection("users").where("role", "==", Role.ADMIN.value))
        active_admins = 0
        for snapshot in profiles:
            profile = snapshot.to_dict()
            if not profile:
                continue
            try:
                firebase_user = auth.get_user(snapshot.id)
            except Exception:
                continue
            if not firebase_user.disabled and snapshot.id != uid:
                active_admins += 1
        if active_admins == 0:
            raise HTTPException(status_code=409, detail="Cannot remove the last active administrator")
        transaction.set(db.collection("admin_safety").document("guard"), {"checked_at": datetime.now(timezone.utc)})

    check(transaction)


@router.get("/me", response_model=CurrentUser)
def me(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    return user


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def provision_user(payload: UserProvision, user: CurrentUser = Depends(require_roles(Role.ADMIN))):
    db = get_firestore_client()
    _validate_centre_active(db, payload.centre_ids)
    email = f"{payload.mobile}@sparsh.local"
    try:
        firebase_user = auth.create_user(email=email, password=payload.password, display_name=payload.name)
    except auth.EmailAlreadyExistsError as exc:
        raise HTTPException(status_code=409, detail="A user with this mobile number already exists") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Unable to create authentication account") from exc

    profile = {
        "name": payload.name,
        "role": payload.role.value,
        "centre_ids": payload.centre_ids,
        "created_at": datetime.now(timezone.utc),
        "created_by": user.uid,
    }
    try:
        _write_profile_with_active_centres(db, firebase_user.uid, profile, create=True)
    except Exception as exc:
        try:
            auth.delete_user(firebase_user.uid)
        except Exception:
            # A failed compensation can leave an orphaned Firebase account. It has
            # no Firestore profile and is rejected by API authorization.
            pass
        raise HTTPException(status_code=500, detail="Unable to create user profile") from exc
    return _user_response({"uid": firebase_user.uid, **profile}, firebase_user)


@router.get("", response_model=list[UserResponse])
def list_users(user: CurrentUser = Depends(require_roles(Role.ADMIN))):
    responses = []
    for snapshot in get_firestore_client().collection("users").stream():
        profile = _profile_from_snapshot(snapshot)
        try:
            firebase_user = auth.get_user(profile["uid"])
        except Exception:
            continue
        responses.append(_user_response(profile, firebase_user))
    return sorted(responses, key=lambda item: (item.name.casefold(), item.uid))


@router.get("/{uid}", response_model=UserResponse)
def get_user(uid: str, user: CurrentUser = Depends(require_roles(Role.ADMIN))):
    profile = _profile_from_snapshot(get_firestore_client().collection("users").document(uid).get())
    try:
        firebase_user = auth.get_user(uid)
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Authentication account not found") from exc
    return _user_response(profile, firebase_user)


@router.patch("/{uid}", response_model=UserResponse)
def update_user(uid: str, payload: UserUpdate, user: CurrentUser = Depends(require_roles(Role.ADMIN))):
    db = get_firestore_client()
    ref = db.collection("users").document(uid)
    profile = _profile_from_snapshot(ref.get())
    updates = payload.model_dump(exclude_unset=True)

    _verify_auth_account_exists(uid)

    _ensure_not_removing_last_active_admin(db, uid, profile, new_role=updates.get("role"))

    updated_profile = _write_profile_with_active_centres(db, uid, updates, create=False)
    firebase_user = auth.get_user(uid)
    return _user_response({"uid": uid, **updated_profile}, firebase_user)


@router.patch("/{uid}/activation", response_model=UserResponse)
def set_user_activation(uid: str, payload: UserActivationUpdate, user: CurrentUser = Depends(require_roles(Role.ADMIN))):
    db = get_firestore_client()
    profile = _profile_from_snapshot(db.collection("users").document(uid).get())

    _verify_auth_account_exists(uid)

    current_firebase_user = auth.get_user(uid)
    if payload.disabled and not current_firebase_user.disabled:
        _ensure_not_removing_last_active_admin(db, uid, profile, disabling=True)

    try:
        firebase_user = auth.update_user(uid, disabled=payload.disabled)
    except auth.UserNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Authentication account not found") from exc
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Authentication account not found") from exc
    return _user_response(profile, firebase_user)

from collections.abc import Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from app.core.firebase import get_firestore_client
from app.models.auth import CurrentUser, Role

bearer_scheme = HTTPBearer(auto_error=False)
def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> CurrentUser:
    if credentials is None: raise HTTPException(status_code=401, detail="Missing bearer token")
    try: token = auth.verify_id_token(credentials.credentials)
    except Exception as exc: raise HTTPException(status_code=401, detail="Invalid Firebase token") from exc
    profile = get_firestore_client().collection("users").document(token["uid"]).get().to_dict() or {}
    try: role = Role(token.get("role") or profile.get("role"))
    except ValueError as exc: raise HTTPException(status_code=403, detail="A valid role is required") from exc
    return CurrentUser(uid=token["uid"], role=role, name=token.get("name") or profile.get("name"), centre_ids=token.get("centre_ids") or profile.get("centre_ids", []))
def require_roles(*roles: Role) -> Callable:
    def guard(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in roles: raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return guard
def ensure_centre_access(user: CurrentUser, centre_id: str) -> None:
    if user.role is not Role.ADMIN and centre_id not in user.centre_ids: raise HTTPException(status_code=403, detail="Centre access denied")

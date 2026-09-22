from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from app.core.firebase import get_firestore_client
from app.models.auth import CurrentUser, Role


bearer_scheme = HTTPBearer(auto_error=False)


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication credentials",
    )


def _profile_centre_ids(profile: dict) -> list[str]:
    centre_ids = profile.get("centre_ids", [])
    if not isinstance(centre_ids, list) or any(
        not isinstance(centre_id, str) or not centre_id.strip() for centre_id in centre_ids
    ):
        raise ValueError("Invalid centre assignments")
    return [centre_id.strip() for centre_id in centre_ids]


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    """Authenticate with Firebase and authorize from the Firestore user profile."""
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    try:
        token = auth.verify_id_token(credentials.credentials, check_revoked=True)
        uid = token.get("uid")
        if not isinstance(uid, str) or not uid:
            raise ValueError("Token has no uid")

        profile = get_firestore_client().collection("users").document(uid).get().to_dict()
        if not isinstance(profile, dict):
            raise ValueError("User profile not found")

        role = Role(profile.get("role"))
        name = profile.get("name")
        if name is not None and not isinstance(name, str):
            raise ValueError("Invalid profile name")
        return CurrentUser(
            uid=uid,
            role=role,
            name=name,
            centre_ids=_profile_centre_ids(profile),
        )
    except HTTPException:
        raise
    except Exception as exc:
        # Firebase distinguishes invalid, expired, revoked, and disabled tokens.
        # Deliberately expose one response so callers cannot learn authentication state.
        raise _unauthorized() from exc


def require_roles(*roles: Role) -> Callable:
    def guard(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return guard


def ensure_centre_access(user: CurrentUser, centre_id: str) -> None:
    if user.role is Role.ADMIN:
        return
    if not centre_id:
        raise HTTPException(status_code=403, detail="A centre assignment is required for this operation")
    if not user.centre_ids:
        raise HTTPException(status_code=403, detail="Your account has no assigned centres")
    if centre_id not in user.centre_ids:
        raise HTTPException(status_code=403, detail="You are not authorized to access this centre")

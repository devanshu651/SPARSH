from collections.abc import Callable
import logging
import re

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from app.core.firebase import get_firestore_client
from app.models.auth import CurrentUser, Role


logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)
_SAFE_PLATFORM_ERROR_CODES = {
    "ABORTED",
    "ALREADY_EXISTS",
    "CANCELLED",
    "DATA_LOSS",
    "DEADLINE_EXCEEDED",
    "FAILED_PRECONDITION",
    "INTERNAL",
    "INVALID_ARGUMENT",
    "NOT_FOUND",
    "OUT_OF_RANGE",
    "PERMISSION_DENIED",
    "RESOURCE_EXHAUSTED",
    "UNAUTHENTICATED",
    "UNAVAILABLE",
    "UNKNOWN",
}
_SAFE_FIREBASE_ERROR_CODES = {
    "auth/argument-error",
    "auth/id-token-expired",
    "auth/id-token-revoked",
    "auth/insufficient-permission",
    "auth/internal-error",
    "auth/invalid-argument",
    "auth/invalid-id-token",
    "auth/network-request-failed",
    "auth/user-disabled",
    "auth/user-not-found",
    "id-token-expired",
    "id-token-revoked",
    "invalid-id-token",
    "user-disabled",
    "user-not-found",
}


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


def _log_auth_failure(stage: str, exc: Exception) -> None:
    """Log only the stage and safe exception metadata; never log exception text."""
    exception_class = type(exc).__name__
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]{0,79}", exception_class):
        exception_class = "Exception"

    diagnostic: dict[str, str | int] = {
        "stage": stage,
        "exception_class": exception_class,
    }

    error_code = getattr(exc, "code", None)
    if (
        isinstance(error_code, str)
        and error_code in _SAFE_PLATFORM_ERROR_CODES | _SAFE_FIREBASE_ERROR_CODES
    ):
        diagnostic["firebase_error_code"] = error_code
    elif isinstance(error_code, int) and not isinstance(error_code, bool) and 100 <= error_code <= 599:
        diagnostic["firebase_error_code"] = error_code

    error_status = getattr(exc, "status_code", None)
    if not isinstance(error_status, int) or isinstance(error_status, bool):
        response = getattr(exc, "http_response", None)
        error_status = getattr(response, "status_code", None)
    if isinstance(error_status, int) and not isinstance(error_status, bool) and 100 <= error_status <= 599:
        diagnostic["firebase_error_status"] = error_status

    logger.warning("Authentication dependency stage failed", extra=diagnostic)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    """Authenticate with Firebase and authorize from the Firestore user profile."""
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    # Firebase Admin is initialized lazily by the existing backend initializer.
    # Initialize it before the first Auth SDK call so a fresh process can verify
    # its first request as well as subsequent requests.
    try:
        db = get_firestore_client()
    except HTTPException:
        raise
    except Exception as exc:
        _log_auth_failure("firebase_init", exc)
        raise _unauthorized() from exc

    try:
        token = auth.verify_id_token(credentials.credentials, check_revoked=True)
        uid = token.get("uid")
        if not isinstance(uid, str) or not uid:
            raise ValueError("Token has no uid")
    except HTTPException:
        raise
    except Exception as exc:
        _log_auth_failure("token_verification", exc)
        raise _unauthorized() from exc

    try:
        profile = db.collection("users").document(uid).get().to_dict()
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
        _log_auth_failure("profile_lookup", exc)
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

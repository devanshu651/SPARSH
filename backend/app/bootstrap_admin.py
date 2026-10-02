"""One-time, operator-run bootstrap for the first local SPARSH administrator.

This module exposes no API route. It requires explicit local-environment
confirmation and a project ID match, and a Firestore marker permanently closes
the bootstrap after the first successful use.
"""

import os
import re
import sys
from datetime import datetime, timezone

from firebase_admin import auth, exceptions, firestore

from app.core.firebase import get_firebase_app
from app.core.config import settings


CONFIRMATION = "I_CONFIRM_LOCAL_FIRST_ADMIN"
MARKER_COLLECTION = "system"
MARKER_DOCUMENT = "first_admin_bootstrap"
PROMOTE_UID_ENV = "SPARSH_LOCAL_ADMIN_PROMOTE_UID"


class BootstrapFailure(Exception):
    def __init__(self, phase: str, cause: Exception):
        self.phase = phase
        self.cause = cause
        super().__init__(phase)


class ExistingFirebaseAuthUserError(RuntimeError):
    """The requested email already belongs to a Firebase Auth identity."""


def _required_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise ValueError(f"Required environment variable is missing: {name}")
    return value


def _require_auth_email_unused(email: str) -> None:
    try:
        auth.get_user_by_email(email)
    except auth.UserNotFoundError:
        return
    raise ExistingFirebaseAuthUserError("Firebase Auth identity already exists")


def _promote_existing_profile(tx, profile_ref, profile: dict) -> None:
    """Promote an existing worker without changing any other profile fields."""
    if (
        profile.get("role") != "worker"
        or not isinstance(profile.get("name"), str)
        or not profile.get("name", "").strip()
        or not isinstance(profile.get("centre_ids"), list)
    ):
        raise RuntimeError("Selected SPARSH profile is not a complete worker profile")
    tx.update(profile_ref, {"role": "admin"})


def bootstrap() -> None:
    try:
        _bootstrap(_set_phase, _get_phase)
    except BootstrapFailure:
        raise
    except Exception as exc:
        raise BootstrapFailure(_get_phase(), exc) from exc


_phase = "configuration validation"


def _set_phase(value: str) -> None:
    global _phase
    _phase = value


def _get_phase() -> str:
    return _phase


def _bootstrap(set_phase, get_phase) -> None:
    set_phase("configuration validation")
    if _required_env("SPARSH_ENVIRONMENT").lower() != "local":
        raise ValueError("Bootstrap is permitted only when SPARSH_ENVIRONMENT=local")
    if _required_env("SPARSH_LOCAL_ADMIN_BOOTSTRAP") != CONFIRMATION:
        raise ValueError("Explicit local bootstrap confirmation is required")
    project_id = _required_env("SPARSH_LOCAL_ADMIN_PROJECT_ID")
    if not settings.firebase_project_id or project_id != settings.firebase_project_id:
        raise ValueError("Bootstrap project ID does not match backend Firebase configuration")

    mobile = _required_env("SPARSH_LOCAL_ADMIN_MOBILE")
    mobile = re.sub(r"[ -]", "", mobile)
    if not re.fullmatch(r"\d{10}", mobile):
        raise ValueError("Admin mobile number must contain exactly 10 digits")
    promote_uid = os.environ.get(PROMOTE_UID_ENV, "").strip()
    if promote_uid:
        if "/" in promote_uid:
            raise ValueError(f"{PROMOTE_UID_ENV} is invalid")
        name = None
        password = None
    else:
        name = _required_env("SPARSH_LOCAL_ADMIN_NAME")
        password = os.environ.get("SPARSH_LOCAL_ADMIN_PASSWORD", "")
        if not name or len(name) > 120:
            raise ValueError("SPARSH_LOCAL_ADMIN_NAME must be 1 to 120 characters after trimming")
        if len(password) < 6 or len(password) > 256:
            raise ValueError("SPARSH_LOCAL_ADMIN_PASSWORD must be 6 to 256 characters")

    set_phase("Firebase Admin initialization")
    app = get_firebase_app()
    set_phase("Firestore client initialization")
    db = firestore.client(app=app)
    email = f"{mobile}@sparsh.local"
    existing_auth_user = None
    if promote_uid:
        set_phase("Firebase Auth user lookup")
        existing_auth_user = auth.get_user_by_email(email)
        if existing_auth_user.uid != promote_uid:
            raise RuntimeError("Firebase Auth identity does not match the explicitly selected UID")
        if existing_auth_user.disabled:
            raise RuntimeError("Disabled Firebase Auth identities cannot be promoted")

    marker_ref = db.collection(MARKER_COLLECTION).document(MARKER_DOCUMENT)
    users = db.collection("users")
    transaction = db.transaction()

    @firestore.transactional
    def reserve(tx):
        set_phase("Bootstrap marker lookup")
        if marker_ref.get(transaction=tx).exists:
            raise RuntimeError("First-admin bootstrap has already been used or reserved")
        set_phase("Backend Admin profile lookup")
        admins = tx.get(users.where("role", "==", "admin"))
        if next(iter(admins), None) is not None:
            raise RuntimeError("An administrator already exists; bootstrap is closed")
        set_phase("Bootstrap marker write")
        tx.create(marker_ref, {"status": "in_progress", "started_at": datetime.now(timezone.utc)})

    reserve(transaction)
    created_uid = None
    try:
        if promote_uid:
            created_uid = None
            uid = promote_uid
        else:
            set_phase("Firebase Auth user lookup")
            _require_auth_email_unused(email)

            set_phase("Firebase Auth user creation")
            firebase_user = auth.create_user(
                email=email, password=password, display_name=name
            )
            created_uid = firebase_user.uid
            uid = created_uid

        profile_ref = users.document(uid)
        finish_tx = db.transaction()

        @firestore.transactional
        def finish(tx):
            set_phase("Bootstrap marker lookup")
            marker = marker_ref.get(transaction=tx).to_dict()
            if not marker or marker.get("status") != "in_progress":
                raise RuntimeError("Bootstrap reservation is not valid")
            profile_snapshot = profile_ref.get(transaction=tx)
            if promote_uid:
                if not profile_snapshot.exists:
                    raise RuntimeError("Selected Firebase Auth identity has no SPARSH profile")
                profile = profile_snapshot.to_dict() or {}
                set_phase("Firestore users/{uid} role promotion")
                _promote_existing_profile(tx, profile_ref, profile)
            else:
                if profile_snapshot.exists:
                    raise RuntimeError("Admin profile already exists")
                set_phase("Firestore users/{uid} write")
                tx.create(profile_ref, {
                    "name": name,
                    "role": "admin",
                    "centre_ids": [],
                    "created_at": datetime.now(timezone.utc),
                    "created_by": "local-bootstrap",
                })
            set_phase("Bootstrap marker write")
            tx.update(marker_ref, {"status": "completed", "completed_at": datetime.now(timezone.utc)})

        finish(finish_tx)
    except Exception as exc:
        # Compensate only while the marker is still reserved. If completion
        # committed, preserve the Auth account and marker for operator review.
        try:
            marker = marker_ref.get().to_dict() or {}
            if marker.get("status") == "in_progress":
                if created_uid:
                    try:
                        auth.delete_user(created_uid)
                    except Exception:
                        pass
                marker_ref.delete()
        except Exception:
            # Preserve the original failure; diagnostics never print this cleanup
            # exception because it may only obscure the operation that failed.
            pass
        raise BootstrapFailure(get_phase(), exc) from exc


def _auth_lookup_reason(exc: Exception) -> str:
    if isinstance(exc, ExistingFirebaseAuthUserError):
        return "already-existing-user"
    if isinstance(exc, auth.UserNotFoundError):
        return "user-not-found"
    if isinstance(exc, ValueError):
        return "invalid-email"
    if isinstance(exc, exceptions.FirebaseError):
        code = str(getattr(exc, "code", "")).lower()
        if any(term in code for term in ("permission", "unauthorized", "credential", "forbidden")):
            return "permission-or-credential-error"
        if any(term in code for term in ("unavailable", "timeout", "network", "connection")):
            return "network-error"
        return "firebase-auth-api-error"
    exception_name = type(exc).__name__.lower()
    if any(term in exception_name for term in ("connectionerror", "connecttimeout", "timeout")):
        return "network-error"
    return "unexpected-sdk-error"


def main() -> int:
    try:
        bootstrap()
    except Exception as exc:
        # Exception messages contain validation/setup details only; never dump
        # environment values, credentials, password, or Firebase identifiers.
        local_diagnostics = os.environ.get("SPARSH_ENVIRONMENT", "").strip().lower() == "local"
        if isinstance(exc, BootstrapFailure):
            cause = exc.cause
            if local_diagnostics:
                code = getattr(cause, "code", None)
                status = getattr(cause, "status_code", None)
                if status is None:
                    status = getattr(getattr(cause, "http_response", None), "status_code", None)
                detail = f"phase={exc.phase}; exception_type={type(cause).__name__}"
                if code is not None:
                    detail += f"; code={code}"
                if status is not None:
                    detail += f"; status={status}"
                if exc.phase == "Firebase Auth user lookup":
                    detail += f"; reason={_auth_lookup_reason(cause)}"
                # Every ValueError raised before Firebase initialization uses a
                # fixed, value-free validation message. Printing that message
                # identifies the field without echoing its configured value.
                if isinstance(cause, ValueError):
                    detail += f"; validation={cause}"
                print(f"Admin bootstrap failed: {detail}", file=sys.stderr)
                return 1
            message = "Bootstrap failed; enable local diagnostics for phase details"
        elif isinstance(exc, (ValueError, RuntimeError)) and local_diagnostics:
            message = str(exc)
        else:
            message = "Bootstrap failed; check local configuration and service access"
        print(f"Admin bootstrap failed: {message}", file=sys.stderr)
        return 1
    if os.environ.get(PROMOTE_UID_ENV, "").strip():
        print("Existing Auth identity promoted to Admin. Bootstrap is now permanently closed.")
    else:
        print("First Admin created. Bootstrap is now permanently closed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

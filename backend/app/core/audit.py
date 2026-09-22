import logging

from firebase_admin import firestore

from app.core.firebase import get_firestore_client

logger = logging.getLogger("sparsh.audit")

ALLOWED_ACTIONS = frozenset({
    "child_created",
    "health_data_created",
    "screening_submitted",
    "referral_created",
})

AUDIT_COLLECTION = "audit_logs"


def audit_log(uid, action, resource_id, centre_id=None):
    if action not in ALLOWED_ACTIONS:
        raise ValueError(f"unsupported audit action: {action!r}")
    if not isinstance(uid, str) or not uid:
        raise ValueError("audit uid is required")
    if not isinstance(resource_id, str) or not resource_id:
        raise ValueError("audit resource_id is required")

    record = {
        "uid": uid,
        "action": action,
        "resource_id": resource_id,
        "timestamp": firestore.SERVER_TIMESTAMP,
    }
    if centre_id:
        record["centre_id"] = centre_id

    try:
        get_firestore_client().collection(AUDIT_COLLECTION).add(record)
    except Exception:
        logger.exception(
            "audit write failed for action=%s resource_id=%s",
            action,
            resource_id,
        )

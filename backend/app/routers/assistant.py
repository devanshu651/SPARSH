from fastapi import APIRouter, Depends, HTTPException

from app.core.audit import audit_log
from app.core.firebase import get_firestore_client
from app.core.security import ensure_centre_access, require_roles
from app.models.auth import CurrentUser, Role
from app.routers.children import child_from_snapshot
from app.ai.schemas import AssistantRequest

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/respond")
def assistant_response(payload: AssistantRequest, user: CurrentUser = Depends(require_roles(Role.WORKER, Role.SUPERVISOR))):
    db = get_firestore_client()
    screening = db.collection("screenings").document(payload.screening_id).get().to_dict()
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found")
    child = child_from_snapshot(db.collection("children").document(screening["child_id"]).get())
    ensure_centre_access(user, child["centre_id"])
    audit_log(user.uid, "assistant_requested", payload.screening_id, child["centre_id"])
    raise HTTPException(status_code=503, detail="SPARSH Assistant is not configured on this environment.")

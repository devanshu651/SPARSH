from fastapi import APIRouter, Depends, HTTPException
from app.ai.assistant import LocalGroundedProvider
from app.ai.knowledge import missed_milestone_text
from app.ai.schemas import AssistantRequest, AssistantResponse
from app.core.audit import audit_log
from app.core.firebase import get_firestore_client
from app.core.security import ensure_centre_access, get_current_user
from app.models.auth import CurrentUser
from app.routers.children import child_from_snapshot

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/respond", response_model=AssistantResponse)
def assistant_response(payload: AssistantRequest, user: CurrentUser = Depends(get_current_user)):
    db = get_firestore_client()
    doc = db.collection("screenings").document(payload.screening_id).get()
    screening = doc.to_dict()
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found")
    child = child_from_snapshot(db.collection("children").document(screening["child_id"]).get())
    ensure_centre_access(user, child["centre_id"])
    history = [item.to_dict() for item in db.collection("screenings").where("child_id", "==", screening["child_id"]).stream()]
    if payload.action == "explain_missed":
        screening = dict(screening)
        screening["missed_milestones"] = missed_milestone_text(screening.get("answers", []))
    audit_log(user.uid, "assistant_requested", payload.screening_id, child["centre_id"])
    return AssistantResponse(text=LocalGroundedProvider().respond(payload, screening, history))

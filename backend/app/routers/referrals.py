from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.firebase import get_firestore_client
from app.core.security import ensure_centre_access, require_roles
from app.models.auth import CurrentUser, Role
from app.models.referral import ReferralCreate, ReferralResponse
from app.routers.children import age_months, child_from_snapshot
router = APIRouter(prefix="/referrals", tags=["referrals"])
@router.post("", response_model=ReferralResponse, status_code=status.HTTP_201_CREATED)
def generate_referral(payload: ReferralCreate, user: CurrentUser = Depends(require_roles(Role.WORKER, Role.ADMIN))):
    db=get_firestore_client(); screening=db.collection("screenings").document(payload.screening_id).get().to_dict()
    if not screening: raise HTTPException(status_code=404, detail="Screening not found")
    if screening["risk_level"] != "RED": raise HTTPException(status_code=409, detail="Referrals are only generated for RED risk screenings")
    child=child_from_snapshot(db.collection("children").document(screening["child_id"]).get()); ensure_centre_access(user, child["centre_id"])
    now=datetime.now(timezone.utc); result={"child_name":child["name"],"child_id":child["id"],"child_identifier":child["child_identifier"],"age_months":age_months(child["date_of_birth"]),"risk_level":screening["risk_level"],"domain_scores":screening["domain_scores"],"facility_name":payload.facility_name,"worker_name":user.name,"worker_id":user.uid,"generated_at":now}
    ref=db.collection("referrals").document(); db.collection("referrals").document(ref.id).set(result | {"screening_id": payload.screening_id}); return ReferralResponse(referral_id=ref.id, **result)

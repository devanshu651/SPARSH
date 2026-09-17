from datetime import datetime

from pydantic import BaseModel, Field

from app.models.screening import DomainScore, RiskLevel


class ReferralCreate(BaseModel):
    screening_id: str
    facility_name: str = Field(min_length=1, max_length=160)


class ReferralResponse(BaseModel):
    referral_id: str
    child_name: str
    child_id: str
    child_identifier: str
    age_months: int
    risk_level: RiskLevel
    domain_scores: dict[str, DomainScore]
    facility_name: str
    worker_name: str | None = None
    worker_id: str
    generated_at: datetime

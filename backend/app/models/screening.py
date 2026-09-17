from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Domain(str, Enum):
    GROSS_MOTOR = "gross_motor"
    FINE_MOTOR = "fine_motor"
    LANGUAGE = "language"
    SOCIAL_EMOTIONAL = "social_emotional"
    COGNITIVE = "cognitive"


class ResponseChoice(str, Enum):
    YES = "YES"
    NO = "NO"
    UNSURE = "UNSURE"


class RiskLevel(str, Enum):
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    RED = "RED"


class ScreeningAnswer(BaseModel):
    model_config = ConfigDict(extra="forbid")

    milestone_id: str = Field(min_length=1)
    response: ResponseChoice

    @field_validator("milestone_id")
    @classmethod
    def strip_milestone_id(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value


class ScreeningSubmit(BaseModel):
    model_config = ConfigDict(extra="forbid")

    child_id: str
    answers: list[ScreeningAnswer] = Field(min_length=1)
    checkpoint_age_months: int = Field(ge=0)
    milestone_dataset_version: str = Field(min_length=1, max_length=80)
    client_submission_id: str = Field(min_length=1, max_length=120)
    screened_at: datetime = Field(default_factory=datetime.utcnow)
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("child_id", "milestone_dataset_version", "client_submission_id")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value


class DomainScore(BaseModel):
    missed_weight: float
    missed_count: int
    unsure_count: int
    status: str


class RiskScoreResponse(BaseModel):
    screening_id: str
    child_id: str
    risk_level: RiskLevel
    risk_label: str
    total_missed_weight: float
    domain_scores: dict[str, DomainScore]
    recommendation: str
    milestone_dataset_version: str
    screened_at: datetime


class ScreeningHistoryItem(BaseModel):
    screening_id: str
    screened_at: datetime
    risk_level: RiskLevel
    total_missed_weight: float


class ChildHistoryResponse(BaseModel):
    child_id: str
    screenings: list[ScreeningHistoryItem]

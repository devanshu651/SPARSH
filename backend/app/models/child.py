from datetime import date, datetime

from pydantic import BaseModel, Field


class ChildCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    date_of_birth: date
    child_identifier: str = Field(min_length=1, max_length=80)
    sex: str | None = Field(default=None, max_length=30)
    guardian_name: str | None = Field(default=None, max_length=120)
    guardian_phone: str | None = Field(default=None, max_length=30)
    centre_id: str = Field(min_length=1, max_length=80)
    centre_name: str = Field(min_length=1, max_length=160)


class ChildResponse(ChildCreate):
    id: str
    age_months: int
    created_at: datetime
    created_by: str
    latest_risk: str | None = None


class HealthDataCreate(BaseModel):
    measured_on: date = Field(default_factory=date.today)
    weight_kg: float | None = Field(default=None, ge=0, le=80)
    height_cm: float | None = Field(default=None, ge=0, le=250)
    muac_mm: float | None = Field(default=None, ge=0, le=400)
    notes: str | None = Field(default=None, max_length=1000)


class HealthDataResponse(HealthDataCreate):
    id: str
    child_id: str
    recorded_by: str
    created_at: datetime

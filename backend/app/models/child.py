from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ChildCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=120)
    date_of_birth: date
    child_identifier: str = Field(min_length=1, max_length=80)
    sex: str | None = Field(default=None, max_length=30)
    guardian_name: str | None = Field(default=None, max_length=120)
    guardian_phone: str | None = Field(default=None, max_length=30)
    centre_id: str = Field(min_length=1, max_length=80)
    # Kept optional for backwards-compatible requests; the API always replaces
    # it with the name stored for the authorized centre.
    centre_name: str | None = Field(default=None, max_length=160)

    @field_validator("name", "child_identifier")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value

    @field_validator("centre_id")
    @classmethod
    def validate_centre_id(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        if "/" in value:
            raise ValueError("must not contain '/'")
        return value

    @field_validator("date_of_birth")
    @classmethod
    def date_of_birth_must_not_be_future(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("must not be in the future")
        return value


class ChildResponse(ChildCreate):
    centre_name: str = Field(min_length=1, max_length=160)
    id: str
    age_months: int
    created_at: datetime
    created_by: str
    latest_risk: str | None = None


class HealthDataCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    measured_on: date = Field(default_factory=date.today)
    weight_kg: float | None = Field(default=None, ge=0, le=80)
    height_cm: float | None = Field(default=None, ge=0, le=250)
    muac_mm: float | None = Field(default=None, ge=0, le=400)
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("measured_on")
    @classmethod
    def measured_on_must_not_be_future(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("must not be in the future")
        return value


class HealthDataResponse(HealthDataCreate):
    id: str
    child_id: str
    recorded_by: str
    created_at: datetime

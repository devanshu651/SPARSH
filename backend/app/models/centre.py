from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class CentreCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str = Field(min_length=2, max_length=40)
    name: str = Field(min_length=1, max_length=160)
    district: str = Field(min_length=1, max_length=120)
    state: str = Field(min_length=1, max_length=120)
    address: str = Field(min_length=1, max_length=500)

    @field_validator("code", "name", "district", "state", "address")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value

    @field_validator("code")
    @classmethod
    def normalise_code(cls, value: str) -> str:
        # Codes are compared after trimming outer whitespace and uppercasing.
        return value.upper()


class CentreUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=160)
    district: str | None = Field(default=None, min_length=1, max_length=120)
    state: str | None = Field(default=None, min_length=1, max_length=120)
    address: str | None = Field(default=None, min_length=1, max_length=500)
    active: bool | None = None

    @field_validator("name", "district", "state", "address")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value

    @model_validator(mode="after")
    def require_change(self) -> "CentreUpdate":
        if not self.model_fields_set:
            raise ValueError("At least one centre field must be provided")
        return self


class CentreResponse(CentreCreate):
    id: str
    active: bool
    created_at: datetime
    created_by: str

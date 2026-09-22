from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class Role(str, Enum):
    WORKER = "worker"
    SUPERVISOR = "supervisor"
    ADMIN = "admin"


class CurrentUser(BaseModel):
    uid: str
    role: Role
    name: str | None = None
    centre_ids: list[str] = Field(default_factory=list)


class UserProfile(BaseModel):
    uid: str
    name: str
    role: Role
    centre_ids: list[str] = Field(default_factory=list)


def _clean_name(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("must not be blank")
    return value


def _unique_centre_ids(value: list[str]) -> list[str]:
    cleaned = []
    for centre_id in value:
        centre_id = centre_id.strip()
        if not centre_id or "/" in centre_id:
            raise ValueError("contains an invalid centre ID")
        if centre_id in cleaned:
            raise ValueError("contains duplicate centre IDs")
        cleaned.append(centre_id)
    return cleaned


class UserProvision(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=120)
    mobile: str
    password: str = Field(min_length=6, max_length=256)
    role: Role
    centre_ids: list[str] = Field(default_factory=list)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return _clean_name(value)

    @field_validator("mobile", mode="before")
    @classmethod
    def normalize_mobile(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("must contain exactly 10 digits")
        if any(not (character.isdigit() or character in " -") for character in value):
            raise ValueError("must contain exactly 10 digits")
        value = "".join(character for character in value if character.isdigit())
        if not value.isdigit() or len(value) != 10:
            raise ValueError("must contain exactly 10 digits")
        return value

    @field_validator("centre_ids")
    @classmethod
    def validate_centre_ids(cls, value: list[str]) -> list[str]:
        return _unique_centre_ids(value)

    @model_validator(mode="after")
    def restrict_provisioned_roles(self) -> "UserProvision":
        if self.role is Role.ADMIN:
            raise ValueError("admin accounts cannot be provisioned through this endpoint")
        return self


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=120)
    role: Role | None = None
    centre_ids: list[str] | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        return _clean_name(value) if value is not None else None

    @field_validator("centre_ids")
    @classmethod
    def validate_centre_ids(cls, value: list[str] | None) -> list[str] | None:
        return _unique_centre_ids(value) if value is not None else None

    @model_validator(mode="after")
    def require_change(self) -> "UserUpdate":
        if not self.model_fields_set:
            raise ValueError("At least one user field must be provided")
        return self


class UserActivationUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    disabled: bool


class UserResponse(UserProfile):
    disabled: bool
    created_at: datetime | None = None

from enum import Enum

from pydantic import BaseModel, Field


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

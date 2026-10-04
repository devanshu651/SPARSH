"""Typed, versioned milestone content schema independent of the production catalog."""

from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.screening import Domain


class AgeBasis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    basis: str = Field(min_length=1)

    @model_validator(mode="after")
    def basis_must_not_be_blank(self):
        if not self.basis.strip():
            raise ValueError("age basis must not be blank")
        return self


class CheckpointAge(AgeBasis):
    type: Literal["checkpoint"]
    months: int = Field(ge=0)


class RangeAge(AgeBasis):
    type: Literal["range"]
    min_months: float = Field(ge=0)
    max_months: float = Field(ge=0)

    @model_validator(mode="after")
    def range_bounds_must_increase(self):
        if self.max_months <= self.min_months:
            raise ValueError("max_months must be greater than min_months")
        return self


class ReviewRequiredAge(AgeBasis):
    type: Literal["review_required"]
    months: None = Field(...)


ContentAge = Annotated[
    CheckpointAge | RangeAge | ReviewRequiredAge,
    Field(discriminator="type"),
]


class LocalizedQuestion(BaseModel):
    model_config = ConfigDict(extra="allow")

    en: str
    hi: str | None = None


class SourceReference(BaseModel):
    """Structured provenance with room for source-specific metadata."""

    model_config = ConfigDict(extra="allow")

    organization: str | None = None
    title: str | None = None
    url: str | None = None
    source_age_months: float | None = None
    source_age_range_months: tuple[float, float] | None = None
    source_domain: str | None = None
    evidence_status: str | None = None
    review_note: str | None = None


class MilestoneContentItem(BaseModel):
    """A content record with an explicit, non-coercible age representation."""

    model_config = ConfigDict(extra="allow")

    id: str = Field(min_length=1)
    domain: Domain
    question: str | LocalizedQuestion
    age: ContentAge
    weight: float | None = None
    red_flag: bool = False
    dataset_version: str | None = None
    source_references: list[SourceReference] = Field(default_factory=list)
    source_age_months: float | None = None
    source_age_range_months: tuple[float, float] | None = None
    evidence_status: str | None = None
    mapping_status: str | None = None
    clinical_review_status: str | None = None
    wording_review_status: str | None = None


class MilestoneContentDataset(BaseModel):
    """Normalized content catalog; legacy-format marks compatibility conversion."""

    model_config = ConfigDict(extra="allow")

    version: str = Field(min_length=1)
    items: list[MilestoneContentItem]
    status: str | None = None
    clinical_validation: bool | None = None
    legacy_format: bool = Field(default=False, exclude=True)

    @model_validator(mode="after")
    def validate_unique_ids_and_versions(self):
        ids = [item.id for item in self.items]
        if len(ids) != len(set(ids)):
            raise ValueError("milestone content IDs must be unique within a dataset")
        for index, item in enumerate(self.items):
            if item.dataset_version is None:
                self.items[index] = item.model_copy(update={"dataset_version": self.version})
        return self

"""Validation for the non-production SPARSH questionnaire draft manifest."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.screening import Domain


AgeStatus = Literal[
    "source_checkpoint_anchor_pending_professional_review",
    "attainment_window_reference_only",
    "source_age_requires_professional_review",
]


class DraftQuestionSource(BaseModel):
    model_config = ConfigDict(extra="forbid")

    organization: str = Field(min_length=1)
    title: str = Field(min_length=1)
    source_domain: str = Field(min_length=1)
    url: str = Field(min_length=8)
    source_item_id: str = Field(min_length=1)
    age_semantics: str = Field(min_length=1)


class DraftQuestionnaireItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    source_item_id: str = Field(min_length=1)
    domain: Domain
    question: str = Field(min_length=1)
    applicable_age_min_months: float | None = Field(default=None, ge=0)
    applicable_age_max_months: float | None = Field(default=None, ge=0)
    age_applicability_status: AgeStatus
    source_age_months: float | None = Field(default=None, ge=0)
    source_age_range_months: tuple[float, float] | None = None
    basis: str = Field(min_length=1)
    source: DraftQuestionSource
    rights_status: str = Field(min_length=1)
    review_status: Literal["pending_professional_review"]
    clinical_validation: Literal[False]
    activation_eligible: Literal[False]

    @model_validator(mode="after")
    def validate_age_representation(self):
        minimum = self.applicable_age_min_months
        maximum = self.applicable_age_max_months
        if (minimum is None) != (maximum is None):
            raise ValueError("applicable age bounds must both be set or both be null")
        if minimum is not None and maximum < minimum:
            raise ValueError("applicable_age_max_months must be >= minimum")
        if self.source_age_range_months is not None:
            low, high = self.source_age_range_months
            if low < 0 or high <= low:
                raise ValueError("source age range must be nonnegative and increasing")
        if self.age_applicability_status == "source_checkpoint_anchor_pending_professional_review":
            if minimum is None or minimum != maximum:
                raise ValueError("source checkpoint anchors require equal explicit bounds")
        if self.age_applicability_status == "attainment_window_reference_only":
            if self.source_age_range_months is None:
                raise ValueError("attainment window reference requires source range")
        if self.age_applicability_status == "source_age_requires_professional_review":
            if minimum is not None or maximum is not None:
                raise ValueError("unresolved source ages cannot be selection bounds")
        return self


class DraftQuestionnaireManifest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: str = Field(min_length=1)
    status: Literal["draft_pending_professional_review"]
    clinical_validation: Literal[False]
    items: list[DraftQuestionnaireItem] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_ids_and_domain_coverage(self):
        ids = [item.id for item in self.items]
        if len(ids) != len(set(ids)):
            raise ValueError("draft item IDs must be unique")
        expected = {domain.value for domain in Domain}
        actual = {item.domain.value for item in self.items}
        if actual != expected:
            raise ValueError("draft must include exactly the five SPARSH domains")
        return self


def draft_checkpoint_candidates_for_age(
    manifest: DraftQuestionnaireManifest, age_months: float
) -> list[DraftQuestionnaireItem]:
    """Return exact CDC source-age anchors for review, never an active screening set.

    A source-age anchor is not a screening applicability interval. This helper is
    only for draft coverage reporting and intentionally does not cumulate earlier
    milestones or select WHO/AAP material.
    """
    if age_months < 0:
        raise ValueError("age must be nonnegative")
    return [
        item
        for item in manifest.items
        if item.age_applicability_status
        == "source_checkpoint_anchor_pending_professional_review"
        and item.applicable_age_min_months == age_months
        and item.applicable_age_max_months == age_months
    ]

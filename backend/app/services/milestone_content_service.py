"""Load and select typed age-aware content for production screening."""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.milestone_content import (
    CheckpointAge,
    MilestoneContentDataset,
    MilestoneContentItem,
    RangeAge,
    ReviewRequiredAge,
)


class LegacyMilestone(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str = Field(min_length=1)
    age_months: int = Field(ge=0)
    domain: str
    description: str
    weight: float | None = None
    red_flag: bool = False
    question: str | None = None
    dataset_version: str | None = None


class LegacyMilestoneDataset(BaseModel):
    model_config = ConfigDict(extra="allow")

    version: str
    milestones: list[LegacyMilestone]


class QuestionEligibility(StrEnum):
    """Why a catalog item is or is not eligible for a screening checkpoint."""

    APPLICABLE_NOW = "applicable_now"
    APPLICABLE_AT_ANOTHER_AGE = "applicable_at_another_age"
    RANGE_APPLICABLE = "range_applicable"
    UNRESOLVED = "unresolved_review_required"
    UNSUPPORTED = "unsupported_source_applicability"


def is_question_applicable(
    question: MilestoneContentItem,
    screening_age_months: int,
    screening_checkpoint_months: int,
) -> QuestionEligibility:
    """Classify age applicability without treating age as a permanent lower bound.

    A point-age item is eligible only at its selected checkpoint and only when
    its age has reviewed source provenance. A range is eligible only when its
    basis explicitly establishes screening applicability; attainment windows
    alone do not establish that policy. Review-required and explicitly held
    content never enter a selection.
    """
    if screening_age_months < 0 or screening_checkpoint_months < 0:
        raise ValueError("screening ages must be non-negative")

    age = question.age
    clinical_status = (question.clinical_review_status or "").casefold()
    wording_status = (question.wording_review_status or "").casefold()
    excluded = {"excluded", "rejected", "held", "blocked", "review_excluded"}
    if clinical_status in excluded or wording_status in excluded:
        return QuestionEligibility.UNRESOLVED

    if isinstance(age, ReviewRequiredAge):
        return QuestionEligibility.UNRESOLVED

    if isinstance(age, CheckpointAge):
        supported = _has_reviewed_source(question) and age.basis.casefold() != "legacy_unverified"
        if not supported:
            return QuestionEligibility.UNSUPPORTED
        if age.months == screening_checkpoint_months and age.months <= screening_age_months:
            return QuestionEligibility.APPLICABLE_NOW
        return QuestionEligibility.APPLICABLE_AT_ANOTHER_AGE

    if isinstance(age, RangeAge):
        supported_for_screening = (
            "screening applicability" in age.basis.casefold()
            and _has_reviewed_source(question)
        )
        if not supported_for_screening:
            return QuestionEligibility.UNSUPPORTED
        if age.min_months <= screening_age_months <= age.max_months:
            return QuestionEligibility.RANGE_APPLICABLE
        return QuestionEligibility.APPLICABLE_AT_ANOTHER_AGE

    return QuestionEligibility.UNSUPPORTED


def _has_reviewed_source(question: MilestoneContentItem) -> bool:
    return any(
        (reference.evidence_status or "").casefold() == "reviewed"
        for reference in question.source_references
    )


def parse_milestone_content(data: dict[str, Any]) -> MilestoneContentDataset:
    """Parse either the new age-aware `items` schema or legacy `milestones`.

    Legacy records are normalized in memory only. Their age basis is marked as
    `legacy_unverified`; no source provenance is inferred from the old catalog.
    """
    if "items" in data:
        return MilestoneContentDataset.model_validate(data)

    legacy = LegacyMilestoneDataset.model_validate(data)
    normalized = []
    for item in legacy.milestones:
        raw = item.model_dump(exclude={"age_months", "description", "question", "dataset_version"})
        raw["question"] = item.question or item.description
        raw["age"] = {
            "type": "checkpoint",
            "months": item.age_months,
            "basis": "legacy_unverified",
        }
        raw["dataset_version"] = item.dataset_version or legacy.version
        raw["source_references"] = []
        normalized.append(MilestoneContentItem.model_validate(raw))

    return MilestoneContentDataset(
        version=legacy.version,
        items=normalized,
        legacy_format=True,
        **{key: value for key, value in data.items() if key not in {"version", "milestones"}},
    )


def checkpoint_items_for_age(
    dataset: MilestoneContentDataset,
    chronological_age_months: int,
) -> tuple[int | None, list[MilestoneContentItem]]:
    """Select only exact checkpoints; never coerce ranges or review-required items.

    Legacy catalogs retain their historic youngest-checkpoint fallback. New
    age-aware catalogs return an empty set when no checkpoint is yet applicable.
    Production structured catalogs use this selector. Ranges remain excluded
    until a reviewed policy defines screening applicability separately from
    attainment evidence.
    """
    if chronological_age_months < 0:
        raise ValueError("chronological age must be non-negative")
    checkpoint_items = [
        item for item in dataset.items if isinstance(item.age, CheckpointAge)
    ]
    checkpoints = sorted({item.age.months for item in checkpoint_items})
    if not checkpoints:
        return None, []

    applicable = [age for age in checkpoints if age <= chronological_age_months]
    if applicable:
        checkpoint = applicable[-1]
    elif dataset.legacy_format:
        checkpoint = checkpoints[0]
    else:
        return None, []

    if dataset.legacy_format:
        return checkpoint, [
            item for item in checkpoint_items if item.age.months == checkpoint
        ]

    selected = [
        item
        for item in dataset.items
        if is_question_applicable(item, chronological_age_months, checkpoint)
        in {QuestionEligibility.APPLICABLE_NOW, QuestionEligibility.RANGE_APPLICABLE}
    ]
    return checkpoint, selected

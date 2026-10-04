"""Load and select typed content without changing production screening behavior."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.milestone_content import (
    CheckpointAge,
    MilestoneContentDataset,
    MilestoneContentItem,
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
    This function is not wired into production routes in this architecture phase.
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

    return checkpoint, [
        item for item in checkpoint_items if item.age.months == checkpoint
    ]

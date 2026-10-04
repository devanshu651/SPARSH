"""Schema and pure mapping logic for non-production age-band draft forms."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.screening import Domain
from app.models.sparsh_screening_draft import DraftQuestionnaireManifest


DOMAINS = {domain.value for domain in Domain}
AGE_BAND_BOUNDS = [
    (0, 5),
    (6, 11),
    (12, 17),
    (18, 23),
    (24, 35),
    (36, 47),
    (48, 59),
    (60, 72),
]


class AgeBandQuestionReference(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str = Field(min_length=1)
    question: str = Field(min_length=1)
    source: str = Field(min_length=1)
    source_reference: str = Field(min_length=8)
    source_age_months: float | None = Field(default=None, ge=0)
    source_age_range_months: tuple[float, float] | None = None
    source_age_semantics: str = Field(min_length=1)
    rights_status: str = Field(min_length=1)
    age_applicability_review_required: Literal[True]
    review_status: Literal["pending_professional_review"]

    @model_validator(mode="after")
    def validate_source_range(self):
        if self.source_age_range_months is not None:
            low, high = self.source_age_range_months
            if low < 0 or high <= low:
                raise ValueError("source age range must be nonnegative and increasing")
        return self


class AgeBandQuestions(BaseModel):
    model_config = ConfigDict(extra="forbid")

    gross_motor: list[AgeBandQuestionReference] = Field(default_factory=list, max_length=8)
    fine_motor: list[AgeBandQuestionReference] = Field(default_factory=list, max_length=8)
    language: list[AgeBandQuestionReference] = Field(default_factory=list, max_length=8)
    cognitive: list[AgeBandQuestionReference] = Field(default_factory=list, max_length=8)
    social_emotional: list[AgeBandQuestionReference] = Field(default_factory=list, max_length=8)


class AgeBandDraft(BaseModel):
    model_config = ConfigDict(extra="forbid")

    min_months: int = Field(ge=0)
    max_months: int = Field(ge=0)
    questions: AgeBandQuestions
    review_note: str = Field(min_length=1)

    @model_validator(mode="after")
    def validate_bounds_and_ids(self):
        if self.max_months < self.min_months:
            raise ValueError("age band maximum must be >= minimum")
        all_ids = [
            ref.item_id
            for domain in DOMAINS
            for ref in getattr(self.questions, domain)
        ]
        if len(all_ids) != len(set(all_ids)):
            raise ValueError("an item ID may occur only once within an age-band form")
        for domain in DOMAINS:
            for ref in getattr(self.questions, domain):
                source_floor = (
                    ref.source_age_range_months[0]
                    if ref.source_age_range_months is not None
                    else ref.source_age_months
                )
                if source_floor is not None and source_floor > self.max_months:
                    raise ValueError("a future source age/window cannot be assigned to this band")
        return self


class AgeBandDraftManifest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: Literal["draft-age-bands-v1"]
    clinical_validation: Literal[False]
    review_status: Literal["pending_professional_review"]
    age_bands: list[AgeBandDraft] = Field(min_length=8, max_length=8)

    @model_validator(mode="after")
    def validate_age_band_sequence(self):
        actual = [(band.min_months, band.max_months) for band in self.age_bands]
        if actual != AGE_BAND_BOUNDS:
            raise ValueError("age bands must match the eight approved draft intervals")
        return self


def _source_floor(item: dict) -> float | None:
    status = item["age_applicability_status"]
    if status == "attainment_window_reference_only":
        source_range = item.get("source_age_range_months")
        return float(source_range[0]) if source_range is not None else None
    source_age = item.get("source_age_months")
    return float(source_age) if source_age is not None else None


def build_age_band_draft(manifest: DraftQuestionnaireManifest) -> dict:
    """Create cumulative review candidates; this is not a runtime selector."""
    bands = []
    for minimum, maximum in AGE_BAND_BOUNDS:
        questions = {domain: [] for domain in DOMAINS}
        for item in manifest.items:
            floor = _source_floor(item.model_dump())
            if floor is None or floor > maximum:
                continue
            source = item.source
            reference = {
                "item_id": item.id,
                "question": item.question,
                "source": source.organization,
                "source_reference": source.url,
                "source_age_months": item.source_age_months,
                "source_age_range_months": item.source_age_range_months,
                "source_age_semantics": source.age_semantics,
                "rights_status": item.rights_status,
                "age_applicability_review_required": True,
                "review_status": "pending_professional_review",
            }
            questions[item.domain.value].append((floor, reference))

        for domain, candidates in questions.items():
            # Put the closest earlier source anchor/window first. Keep the cap at
            # eight per domain without deriving a new age from a mean or range.
            candidates.sort(key=lambda candidate: (-candidate[0], candidate[1]["item_id"]))
            questions[domain] = [reference for _, reference in candidates[:8]]

        bands.append(
            {
                "min_months": minimum,
                "max_months": maximum,
                "questions": questions,
                "review_note": (
                    "Draft cumulative review candidates only. Source anchor/window begins no later "
                    "than this band's maximum; applicability to children throughout this band "
                    "requires professional review. No screening eligibility is asserted."
                ),
            }
        )

    result = {
        "version": "draft-age-bands-v1",
        "clinical_validation": False,
        "review_status": "pending_professional_review",
        "age_bands": bands,
    }
    return AgeBandDraftManifest.model_validate(result).model_dump(mode="json")

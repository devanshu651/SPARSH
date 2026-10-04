import json
import subprocess
import sys
from pathlib import Path

from app.models.sparsh_age_band_draft import (
    AGE_BAND_BOUNDS,
    DOMAINS,
    AgeBandQuestions,
    AgeBandDraftManifest,
    build_age_band_draft,
)
from app.models.sparsh_screening_draft import DraftQuestionnaireManifest


BACKEND_ROOT = Path(__file__).resolve().parents[1]
DRAFT_ITEMS_PATH = BACKEND_ROOT / "app/config/sparsh_screening_questionnaire_draft.json"
AGE_BANDS_PATH = BACKEND_ROOT / "app/config/sparsh_screening_age_bands_draft.json"
PRODUCTION_PATH = BACKEND_ROOT / "app/config/milestones.json"


def _draft_manifest():
    return DraftQuestionnaireManifest.model_validate(
        json.loads(DRAFT_ITEMS_PATH.read_text(encoding="utf-8"))
    )


def _age_band_manifest():
    return AgeBandDraftManifest.model_validate(
        json.loads(AGE_BANDS_PATH.read_text(encoding="utf-8"))
    )


def test_age_band_file_has_all_eight_requested_bands_and_is_unvalidated():
    age_bands = _age_band_manifest()

    assert age_bands.clinical_validation is False
    assert age_bands.review_status == "pending_professional_review"
    assert [(band.min_months, band.max_months) for band in age_bands.age_bands] == AGE_BAND_BOUNDS


def test_every_reference_resolves_to_the_fifty_item_manifest():
    items = {item.id: item for item in _draft_manifest().items}
    age_bands = _age_band_manifest()

    for band in age_bands.age_bands:
        for domain in DOMAINS:
            for reference in getattr(band.questions, domain):
                assert reference.item_id in items
                assert items[reference.item_id].domain.value == domain
                assert reference.question == items[reference.item_id].question
                assert reference.source_reference == items[reference.item_id].source.url
                assert reference.source_age_semantics == items[reference.item_id].source.age_semantics


def test_no_duplicates_or_future_source_ages_within_a_band_form():
    age_bands = _age_band_manifest()

    for band in age_bands.age_bands:
        ids = [
            ref.item_id
            for domain in DOMAINS
            for ref in getattr(band.questions, domain)
        ]
        assert len(ids) == len(set(ids))
        for domain in DOMAINS:
            references = getattr(band.questions, domain)
            assert len(references) <= 8
            for reference in references:
                source_floor = (
                    reference.source_age_range_months[0]
                    if reference.source_age_range_months is not None
                    else reference.source_age_months
                )
                assert source_floor is not None
                assert source_floor <= band.max_months
                assert reference.age_applicability_review_required is True
                assert reference.review_status == "pending_professional_review"


def test_all_five_domain_slots_exist_and_include_candidates_where_available():
    age_bands = _age_band_manifest()

    for band in age_bands.age_bands:
        assert set(AgeBandQuestions.model_fields) == DOMAINS
        assert all(getattr(band.questions, domain) for domain in DOMAINS)


def test_building_forms_does_not_modify_production_catalog():
    before = PRODUCTION_PATH.read_bytes()
    result = build_age_band_draft(_draft_manifest())
    subprocess.run(
        [sys.executable, "scripts/build_sparsh_screening_age_bands_draft.py"],
        cwd=BACKEND_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    after = PRODUCTION_PATH.read_bytes()

    assert result["clinical_validation"] is False
    assert before == after

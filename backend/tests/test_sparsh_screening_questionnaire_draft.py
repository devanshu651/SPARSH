import json
from collections import Counter
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.models.sparsh_screening_draft import (
    DraftQuestionnaireItem,
    DraftQuestionnaireManifest,
    draft_checkpoint_candidates_for_age,
)


BACKEND_ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = BACKEND_ROOT / "app/config/sparsh_screening_questionnaire_draft.json"
SOURCE_PATH = BACKEND_ROOT / "app/config/milestones_expansion_candidate.json"


@pytest.fixture(scope="module")
def raw_manifest():
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def manifest(raw_manifest):
    return DraftQuestionnaireManifest.model_validate(raw_manifest)


def test_draft_has_five_domains_ten_items_each_and_unique_ids(manifest):
    counts = Counter(item.domain.value for item in manifest.items)

    assert len(manifest.items) == 50
    assert set(counts) == {
        "gross_motor",
        "fine_motor",
        "language",
        "cognitive",
        "social_emotional",
    }
    assert counts == {
        "gross_motor": 10,
        "fine_motor": 10,
        "language": 10,
        "cognitive": 10,
        "social_emotional": 10,
    }
    assert len({item.id for item in manifest.items}) == len(manifest.items)


def test_all_items_have_text_provenance_rights_and_pending_status(manifest):
    assert manifest.clinical_validation is False
    assert manifest.status == "draft_pending_professional_review"
    for item in manifest.items:
        assert item.question.strip()
        assert item.source.organization.strip()
        assert item.source.title.strip()
        assert item.source.source_domain.strip()
        assert item.source.url.startswith("https://")
        assert item.source.source_item_id == item.source_item_id
        assert item.rights_status.strip()
        assert item.review_status == "pending_professional_review"
        assert item.clinical_validation is False
        assert item.activation_eligible is False


def test_every_draft_item_maps_to_an_existing_expansion_candidate(manifest):
    source_data = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    source_ids = {item["id"] for item in source_data["items"]}

    assert {item.source_item_id for item in manifest.items} <= source_ids


def test_age_boundaries_are_valid_and_source_semantics_are_preserved(manifest):
    for item in manifest.items:
        minimum = item.applicable_age_min_months
        maximum = item.applicable_age_max_months
        assert (minimum is None) == (maximum is None)
        if minimum is not None:
            assert 0 <= minimum <= maximum
        if item.age_applicability_status == "attainment_window_reference_only":
            assert item.applicable_age_min_months is None
            assert item.applicable_age_max_months is None
            assert item.source_age_range_months is not None
        if item.age_applicability_status == "source_age_requires_professional_review":
            assert item.applicable_age_min_months is None
            assert item.applicable_age_max_months is None


def test_younger_age_draft_anchors_do_not_include_future_source_ages(manifest):
    selected = draft_checkpoint_candidates_for_age(manifest, 6)

    assert selected
    assert all(item.applicable_age_max_months <= 6 for item in selected)
    assert not any(item.applicable_age_min_months == 9 for item in selected)
    assert not draft_checkpoint_candidates_for_age(manifest, 1)


def test_aap_means_and_who_windows_are_not_auto_selected(manifest):
    for age in (2, 6, 12, 24, 36, 60):
        selected_ids = {
            item.id for item in draft_checkpoint_candidates_for_age(manifest, age)
        }
        assert all(
            item.age_applicability_status
            == "source_checkpoint_anchor_pending_professional_review"
            for item in manifest.items
            if item.id in selected_ids
        )
    assert not any(
        item.age_applicability_status == "attainment_window_reference_only"
        and item.id in {
            selected.id
            for age in (2, 6, 12, 24, 36, 60)
            for selected in draft_checkpoint_candidates_for_age(manifest, age)
        }
        for item in manifest.items
    )


@pytest.mark.parametrize(
    "updates",
    [
        {"applicable_age_min_months": 12, "applicable_age_max_months": 6},
        {"applicable_age_min_months": 12, "applicable_age_max_months": None},
        {"applicable_age_min_months": -1, "applicable_age_max_months": 2},
        {"review_status": "approved"},
        {"clinical_validation": True},
        {"activation_eligible": True},
        {"source_age_range_months": [9, 4]},
    ],
)
def test_invalid_draft_item_values_are_rejected(raw_manifest, updates):
    item = dict(raw_manifest["items"][0])
    item.update(updates)

    with pytest.raises(ValidationError):
        DraftQuestionnaireItem.model_validate(item)


def test_manifest_rejects_duplicate_ids_and_missing_domain(raw_manifest):
    duplicate = dict(raw_manifest)
    duplicate["items"] = list(duplicate["items"])
    duplicate["items"].append(dict(duplicate["items"][0]))
    with pytest.raises(ValidationError, match="unique"):
        DraftQuestionnaireManifest.model_validate(duplicate)

    missing_domain = dict(raw_manifest)
    missing_domain["items"] = [
        item for item in raw_manifest["items"] if item["domain"] != "fine_motor"
    ]
    with pytest.raises(ValidationError, match="five SPARSH domains"):
        DraftQuestionnaireManifest.model_validate(missing_domain)

import json
import pytest
from pydantic import ValidationError

from app.models.milestone_content import MilestoneContentDataset, MilestoneContentItem
from app.models.screening import ScreeningSubmit
from app.services.milestone_content_service import (
    QuestionEligibility,
    checkpoint_items_for_age,
    is_question_applicable,
    parse_milestone_content,
)
from app.services.milestone_service import (
    CONFIG_PATH as PRODUCTION_MILESTONES_PATH,
    load_milestone_config,
    milestones_by_id,
    milestones_for_age,
    validate_checkpoint_answers,
)


def _item(item_id, age, **extra):
    return {
        "id": item_id,
        "domain": "gross_motor",
        "question": {"en": "Does the child do this?", "hi": None},
        "age": age,
        "weight": None,
        "red_flag": False,
        "source_references": [
            {"organization": "CDC", "evidence_status": "reviewed"}
        ],
        **extra,
    }


def test_exact_checkpoint_parses_without_changing_source_age():
    item = MilestoneContentItem.model_validate(
        _item("cdc-24", {"type": "checkpoint", "months": 24, "basis": "CDC"})
    )

    assert item.age.type == "checkpoint"
    assert item.age.months == 24
    assert item.age.basis == "CDC"


def test_range_parses_exact_bounds_and_provenance():
    reference = {
        "organization": "WHO",
        "title": "Source title",
        "url": "https://example.invalid/source",
        "source_age_range_months": [18, 24],
        "source_domain": "Gross motor development",
        "evidence_status": "reviewed",
    }
    item = MilestoneContentItem.model_validate(
        _item(
            "who-range",
            {"type": "range", "min_months": 18, "max_months": 24, "basis": "WHO"},
            source_references=[reference],
            mapping_status="DIRECT",
        )
    )

    assert item.age.type == "range"
    assert (item.age.min_months, item.age.max_months) == (18, 24)
    assert item.source_references[0].organization == "WHO"
    assert item.source_references[0].title == "Source title"
    assert item.source_references[0].url == "https://example.invalid/source"
    assert item.source_references[0].source_age_range_months == (18, 24)
    assert item.source_references[0].source_domain == "Gross motor development"
    assert item.source_references[0].evidence_status == "reviewed"
    assert item.mapping_status == "DIRECT"


def test_review_required_age_parses_and_is_not_selected():
    checkpoint = _item(
        "cdc-24", {"type": "checkpoint", "months": 24, "basis": "CDC"}
    )
    unresolved = _item(
        "aap-pending", {"type": "review_required", "months": None, "basis": "AAP"}
    )
    dataset = MilestoneContentDataset.model_validate(
        {"version": "hybrid-test-1", "items": [checkpoint, unresolved]}
    )

    selected_age, selected = checkpoint_items_for_age(dataset, 24)

    assert dataset.items[1].age.type == "review_required"
    assert selected_age == 24
    assert [item.id for item in selected] == ["cdc-24"]


@pytest.mark.parametrize(
    "age",
    [
        {"type": "range", "min_months": 24, "max_months": 18, "basis": "WHO"},
        {"type": "range", "min_months": 18, "max_months": 18, "basis": "WHO"},
        {"type": "range", "min_months": -1, "max_months": 18, "basis": "WHO"},
    ],
)
def test_invalid_range_bounds_are_rejected(age):
    with pytest.raises(ValidationError):
        MilestoneContentItem.model_validate(_item("bad-range", age))


def test_missing_age_basis_is_rejected():
    with pytest.raises(ValidationError, match="basis"):
        MilestoneContentItem.model_validate(
            _item("missing-basis", {"type": "checkpoint", "months": 24})
        )


def test_range_and_review_items_never_silently_join_checkpoint_set():
    dataset = MilestoneContentDataset.model_validate(
        {
            "version": "hybrid-test-1",
            "items": [
                _item("checkpoint-18", {"type": "checkpoint", "months": 18, "basis": "CDC"}),
                _item("who-18-24", {"type": "range", "min_months": 18, "max_months": 24, "basis": "WHO"}),
                _item("aap-pending", {"type": "review_required", "months": None, "basis": "AAP"}),
            ],
        }
    )

    selected_age, selected = checkpoint_items_for_age(dataset, 24)

    assert selected_age == 18
    assert [item.id for item in selected] == ["checkpoint-18"]


def test_legacy_production_catalog_is_backward_compatible_and_ids_are_stable():
    legacy_path = PRODUCTION_MILESTONES_PATH.with_name("milestones_legacy_155.json")
    production_data = json.loads(legacy_path.read_text(encoding="utf-8"))
    dataset = parse_milestone_content(production_data)
    expected_ids = [item["id"] for item in production_data["milestones"]]

    assert dataset.legacy_format is True
    assert [item.id for item in dataset.items] == expected_ids
    assert all(item.age.basis == "legacy_unverified" for item in dataset.items)
    assert all(item.question for item in dataset.items)

    assert len(dataset.items) == 155


def test_active_final_65_is_schema_valid_versioned_and_preserves_age_semantics():
    config = load_milestone_config()
    dataset = parse_milestone_content(
        json.loads(PRODUCTION_MILESTONES_PATH.read_text(encoding="utf-8"))
    )
    active = milestones_by_id()
    from collections import Counter

    assert config["version"] == "phase5-final-65-v2"
    legacy = json.loads(
        PRODUCTION_MILESTONES_PATH.with_name("milestones_legacy_155.json").read_text(
            encoding="utf-8"
        )
    )
    assert config["red_flags"] == legacy["red_flags"]
    assert dataset.version == config["version"]
    assert len(dataset.items) == 65
    assert Counter(item.domain.value for item in dataset.items) == {
        "gross_motor": 13,
        "fine_motor": 13,
        "language": 13,
        "cognitive": 13,
        "social_emotional": 13,
    }
    assert len({item.id for item in dataset.items}) == 65
    candidate = json.loads(
        PRODUCTION_MILESTONES_PATH.with_name("milestones_final_candidate.json").read_text(
            encoding="utf-8-sig"
        )
    )
    assert [item.id for item in dataset.items] == [item["id"] for item in candidate["items"]]
    assert all(item.dataset_version == dataset.version for item in dataset.items)
    assert all(item.weight == 1 for item in dataset.items)
    assert Counter(item.age.type for item in dataset.items) == {
        "checkpoint": 36,
        "range": 3,
        "review_required": 26,
    }
    assert all(item.clinical_review_status == "pending" for item in dataset.items)
    assert all(item.wording_review_status == "pending" for item in dataset.items)
    assert len(active) == 65
    hot_object_item = active["co_36_03"]
    assert "Never introduce a hot object" in hot_object_item["administration_note"]


def test_duplicate_ids_are_rejected_without_rewriting_stable_ids():
    item = _item("stable-id", {"type": "checkpoint", "months": 24, "basis": "CDC"})
    dataset = MilestoneContentDataset.model_validate(
        {"version": "hybrid-test-1", "items": [item]}
    )
    assert dataset.items[0].id == "stable-id"

    with pytest.raises(ValidationError, match="unique"):
        MilestoneContentDataset.model_validate(
            {"version": "hybrid-test-1", "items": [item, item]}
        )


def test_age_aware_screening_submission_shape_and_answer_validation():
    checkpoint, expected = milestones_for_age(13)
    expected_ids = [item["id"] for item in expected]
    payload = ScreeningSubmit.model_validate(
        {
            "child_id": "child-1",
            "answers": [
                {"milestone_id": item_id, "response": "YES"} for item_id in expected_ids
            ],
            "checkpoint_age_months": checkpoint,
            "milestone_dataset_version": "phase5-final-65-v2",
            "client_submission_id": "content-schema-regression",
            "screened_at": "2026-10-04T00:00:00Z",
        }
    )

    validate_checkpoint_answers(expected, [answer.milestone_id for answer in payload.answers])
    assert payload.checkpoint_age_months == 12
    assert len(expected_ids) == 5
    assert payload.milestone_dataset_version == "phase5-final-65-v2"


@pytest.mark.parametrize(
    "age,expected_checkpoint,expected_count",
    [(0, None, 0), (2, 2, 5), (12, 12, 5), (24, 24, 2), (36, 36, 2), (60, 60, 1)],
)
def test_production_selection_matches_explicit_checkpoint_metadata(age, expected_checkpoint, expected_count):
    dataset = parse_milestone_content(
        json.loads(PRODUCTION_MILESTONES_PATH.read_text(encoding="utf-8"))
    )
    expected_checkpoint_from_metadata, content_items = checkpoint_items_for_age(dataset, age)
    actual_checkpoint, actual_items = milestones_for_age(age)

    assert actual_checkpoint == expected_checkpoint_from_metadata == expected_checkpoint
    assert [item["id"] for item in actual_items] == [item.id for item in content_items]
    assert len(actual_items) == expected_count


def test_who_ranges_and_review_required_items_are_never_age_cutoffs():
    catalog = load_milestone_config()["milestones"]
    content = {item["id"]: item for item in catalog}
    range_ids = {item_id for item_id, item in content.items() if item["age"]["type"] == "range"}
    review_ids = {item_id for item_id, item in content.items() if item["age"]["type"] == "review_required"}
    assert len(range_ids) == 3
    assert len(review_ids) == 26
    assert (content["gm_aap13_06_sit_unsupported"]["age"]["min_months"], content["gm_aap13_06_sit_unsupported"]["age"]["max_months"]) == (3.8, 9.2)
    assert "AAP surveillance mean" in content["gm_aap13_02_head_lift"]["age"]["basis"]

    for age in (2, 4, 6, 9, 12, 18, 24, 36, 48, 60):
        _, selected = milestones_for_age(age)
        selected_ids = {item["id"] for item in selected}
        assert not (selected_ids & range_ids)
        assert not (selected_ids & review_ids)


def test_representative_checkpoint_distribution_is_source_derived():
    expected_counts = {2: 5, 12: 5, 24: 2, 36: 2, 60: 1}
    for age, count in expected_counts.items():
        _, selected = milestones_for_age(age)
        assert len(selected) == count
        assert all(item["age"]["type"] == "checkpoint" and item["age"]["months"] == age for item in selected)


def test_age_eligibility_rejects_future_infant_and_unresolved_mismatches():
    dataset = parse_milestone_content(
        json.loads(PRODUCTION_MILESTONES_PATH.read_text(encoding="utf-8"))
    )
    by_id = {item.id: item for item in dataset.items}

    # A 3-month-old follows the configured 2-month checkpoint until the next
    # supported checkpoint; later toddler/school-age milestones cannot leak in.
    checkpoint, infant_selection = checkpoint_items_for_age(dataset, 3)
    assert checkpoint == 2
    assert infant_selection
    assert all(
        is_question_applicable(item, 3, checkpoint) == QuestionEligibility.APPLICABLE_NOW
        for item in infant_selection
    )
    assert is_question_applicable(by_id["gm_aap13_24_jump"], 3, checkpoint) == QuestionEligibility.UNRESOLVED
    assert is_question_applicable(by_id["la_4_02"], 3, checkpoint) == QuestionEligibility.APPLICABLE_AT_ANOTHER_AGE

    # WHO attainment bounds and AAP mean ages are not screening applicability.
    assert is_question_applicable(by_id["gm_aap13_06_sit_unsupported"], 6, 6) == QuestionEligibility.UNSUPPORTED
    assert is_question_applicable(by_id["gm_aap13_02_head_lift"], 60, 60) == QuestionEligibility.UNRESOLVED
    assert is_question_applicable(by_id["co_36_03"], 36, 36) == QuestionEligibility.UNRESOLVED

    # Selection is checkpoint-local: no infant checkpoint item persists as an
    # older child's primary screening question set.
    for age in (12, 24, 36, 60):
        selected_checkpoint, selected = checkpoint_items_for_age(dataset, age)
        assert selected
        assert all(
            is_question_applicable(item, age, selected_checkpoint)
            in {QuestionEligibility.APPLICABLE_NOW, QuestionEligibility.RANGE_APPLICABLE}
            for item in selected
        )
        assert all(item.age.type == "checkpoint" and item.age.months == selected_checkpoint for item in selected)

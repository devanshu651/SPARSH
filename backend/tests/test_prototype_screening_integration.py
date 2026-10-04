import json
from collections import Counter
from datetime import date
from unittest.mock import patch
import pytest

from app.models.auth import CurrentUser, Role
from app.routers import children, screenings
from app.services.milestone_service import (
    PROTOTYPE_DISCLAIMER,
    DRAFT_AGE_BANDS_PATH,
    DRAFT_QUESTIONNAIRE_PATH,
    prototype_milestones_for_age,
)


@pytest.mark.parametrize("age", [24, 36, 48, 60])
def test_supported_prototype_ages_return_eight_questions_per_domain(age):
    checkpoint, questions, band = prototype_milestones_for_age(age)
    counts = Counter(item["domain"] for item in questions)

    assert checkpoint == band["min_months"] == age
    assert band["label"]
    assert len(questions) == 40
    assert len({item["id"] for item in questions}) == 40
    assert counts == {
        "gross_motor": 8,
        "fine_motor": 8,
        "language": 8,
        "cognitive": 8,
        "social_emotional": 8,
    }
    assert all(item["clinical_validation"] is False for item in questions)
    assert all(item["review_status"] == "pending_professional_review" for item in questions)
    assert all(item["age_applicability_review_required"] is True for item in questions)


@pytest.mark.parametrize("age", [0, 5, 6, 11, 12, 17, 18, 23, 24, 35, 36, 47, 48, 59, 60, 72])
def test_prototype_selection_has_no_future_source_age_or_future_band_leakage(age):
    checkpoint, questions, band = prototype_milestones_for_age(age)
    manifest = json.loads(DRAFT_QUESTIONNAIRE_PATH.read_text(encoding="utf-8"))
    manifest_ids = {item["id"] for item in manifest["items"]}
    draft = json.loads(DRAFT_AGE_BANDS_PATH.read_text(encoding="utf-8"))
    applicable_band = next(item for item in draft["age_bands"] if item["min_months"] <= age <= item["max_months"])

    assert band["min_months"] == applicable_band["min_months"]
    assert len({item["id"] for item in questions}) == len(questions)
    assert {item["id"] for item in questions} <= manifest_ids
    assert all(item["clinical_validation"] is False for item in questions)
    # Runtime candidates come exclusively from the age band selected by age.
    band_ids = {ref["item_id"] for domain in applicable_band["questions"].values() for ref in domain}
    assert {item["id"] for item in questions} <= band_ids
    for item in questions:
        metadata = item["age_metadata"]
        source_age = metadata["source_age_months"]
        source_range = metadata["source_age_range_months"]
        assert source_age is None or source_age <= age
        assert source_range is None or source_range[0] <= age


def test_future_source_ages_are_filtered_and_younger_age_count_is_actual():
    checkpoint, questions, band = prototype_milestones_for_age(0)
    assert checkpoint == 0 and band["min_months"] == 0
    assert len(questions) == 0
    assert all(
        (item["age_metadata"]["source_age_months"] is None
         or item["age_metadata"]["source_age_months"] <= 0)
        and (item["age_metadata"]["source_age_range_months"] is None
             or item["age_metadata"]["source_age_range_months"][0] <= 0)
        for item in questions
    )
    checkpoint, questions, band = prototype_milestones_for_age(24)
    assert len(questions) == 40
    assert band["min_months"] == checkpoint == 24
    assert len(questions) == 40


@pytest.mark.parametrize("age", [24, 36, 48, 60])
def test_screening_api_returns_prototype_metadata_and_exact_question_count(age):
    response = screenings.get_milestones(age, user=None)

    assert response["question_count"] == 40
    assert response["prototype"] is True
    assert response["clinical_validation"] is False
    assert response["review_status"] == "pending_professional_review"
    assert response["prototype_disclaimer"] == PROTOTYPE_DISCLAIMER
    assert len({item["id"] for item in response["milestones"]}) == response["question_count"]
    assert Counter(item["domain"] for item in response["milestones"]) == {
        "gross_motor": 8,
        "fine_motor": 8,
        "language": 8,
        "cognitive": 8,
        "social_emotional": 8,
    }


@pytest.mark.parametrize("age", [24, 36, 48, 60])
def test_child_questionnaire_api_returns_exact_age_band_form(age):
    class Snapshot:
        id = "child-prototype"

        def to_dict(self):
            return {"date_of_birth": date(2024, 1, 1), "centre_id": "centre-1"}

    class Document:
        def get(self):
            return Snapshot()

    class Collection:
        def document(self, _child_id):
            return Document()

    class Database:
        def collection(self, _name):
            return Collection()

    user = CurrentUser(uid="worker", role=Role.WORKER, centre_ids=["centre-1"])
    with patch.object(children, "get_firestore_client", return_value=Database()), \
         patch.object(children, "ensure_centre_access"), \
         patch.object(children, "age_months", return_value=age):
        response = children.child_milestones("child-prototype", user)

    assert response["question_count"] == 40
    assert response["checkpoint_age_months"] == age
    assert response["clinical_validation"] is False
    assert response["review_status"] == "pending_professional_review"
    assert Counter(item["domain"] for item in response["milestones"]) == {
        "gross_motor": 8,
        "fine_motor": 8,
        "language": 8,
        "cognitive": 8,
        "social_emotional": 8,
    }

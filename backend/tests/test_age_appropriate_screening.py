import pytest
from datetime import date
from unittest.mock import patch, Mock

from app.models.auth import CurrentUser, Role
from app.routers import children, screenings
from app.services.milestone_service import (
    load_milestone_config,
    milestones_for_age,
    milestones_by_id,
)


def test_milestones_config_structure():
    """Verify milestones.json is loaded and has 74 unique catalog items."""
    config = load_milestone_config()
    milestones = config.get("milestones", [])
    assert len(milestones) == 74
    assert len({m["id"] for m in milestones}) == 74


def test_58_months_selects_48_checkpoint_and_no_infant_questions():
    """
    Core requirement: A 58-month-old maps to the 48-month checkpoint,
    receives a focused questionnaire (~20 questions, actual 18),
    approximately 4 per domain, and NO infant/toddler questions.
    """
    checkpoint, questions = milestones_for_age(58)

    assert checkpoint == 48
    assert len(questions) == 18
    assert len({q["id"] for q in questions}) == 18

    # Ensure domains have balanced representation
    domain_counts = {}
    for q in questions:
        domain_counts[q["domain"]] = domain_counts.get(q["domain"], 0) + 1

    assert domain_counts["gross_motor"] == 2
    assert domain_counts["fine_motor"] == 4
    assert domain_counts["language"] == 4
    assert domain_counts["cognitive"] == 4
    assert domain_counts["social_emotional"] == 4

    question_ids = {q["id"] for q in questions}
    # Expected key items
    assert "la_48_01" in question_ids
    assert "co_48_01" in question_ids
    assert "so_48_01" in question_ids
    assert "so_48_02" in question_ids
    assert "fm_aap13_48_buttons" in question_ids
    assert "gm_aap13_24_jump" in question_ids


def test_58_months_old_bug_regression_prevention():
    """
    MANDATORY TEST: Explicitly verify that a 58-month-old can NEVER receive
    infant milestones (crawling, sitting without support, rolling, standing holding support).
    """
    checkpoint, questions = milestones_for_age(58)

    lower_descriptions = [q.get("description", "").lower() for q in questions]
    inappropriate_keywords = [
        "crawls", "crawl", "rolls over", "roll over",
        "sit without support", "sits without support",
        "stands holding", "holding onto someone's hand", "walk holding",
    ]
    for desc in lower_descriptions:
        for kw in inappropriate_keywords:
            assert kw not in desc, f"Found inappropriate milestone '{kw}' in 58m questions: {desc}"


def test_56_months_selects_48_checkpoint():
    """A 56-month-old maps to the 48-month completed checkpoint."""
    checkpoint, questions = milestones_for_age(56)

    assert checkpoint == 48
    assert len(questions) == 18


def test_60_months_selects_60_checkpoint():
    """A 60-month-old maps to the 60-month checkpoint with age-appropriate questions."""
    checkpoint, questions = milestones_for_age(60)

    assert checkpoint == 60
    assert len(questions) == 16
    question_ids = {q["id"] for q in questions}
    assert "co_60_01" in question_ids
    assert "so_60_01" in question_ids
    assert "so_60_02" in question_ids


def test_72_months_checkpoint_behavior():
    """
    A 72-month-old maps to the 60-month completed checkpoint (the highest available)
    and uses focused screening using the highest appropriate validated existing material.
    """
    checkpoint, questions = milestones_for_age(72)

    assert checkpoint == 60
    assert len(questions) == 16


@pytest.mark.parametrize(
    "age,expected_checkpoint,expected_count",
    [
        (2, 2, 7),
        (6, 6, 26),
        (12, 12, 38),
        (13, 12, 38),
        (18, 18, 40),
        (24, 24, 39),
        (36, 36, 24),
        (48, 48, 18),
        (56, 48, 18),
        (58, 48, 18),
        (60, 60, 16),
        (72, 60, 16),
    ],
)
def test_all_checkpoint_boundaries(age, expected_checkpoint, expected_count):
    """
    Verify checkpoint boundaries across all requested age groups:
    - Expected checkpoint mapping
    - Exact validated question count (age-band progression)
    - No duplicate questions
    """
    checkpoint, questions = milestones_for_age(age)

    assert checkpoint == expected_checkpoint
    assert len(questions) == expected_count

    # No duplicate questions
    question_ids = [q["id"] for q in questions]
    assert len(question_ids) == len(set(question_ids))


def test_child_milestones_api_for_58_months():
    """Verify the /children/{child_id}/milestones endpoint for a 58-month-old child."""
    class Snapshot:
        id = "child-58m"

        def to_dict(self):
            return {"date_of_birth": date(2021, 1, 1), "centre_id": "centre-1"}

    class Document:
        def get(self):
            return Snapshot()

    class Collection:
        def document(self, _child_id):
            return Document()

    class Database:
        def collection(self, _name):
            return Collection()

    worker = CurrentUser(uid="worker", role=Role.WORKER, centre_ids=["centre-1"])
    with patch.object(children, "get_firestore_client", return_value=Database()), \
         patch.object(children, "ensure_centre_access"), \
         patch.object(children, "age_months", return_value=58):
        response = children.child_milestones("child-58m", worker)

    assert response["current_age_months"] == 58
    assert response["checkpoint_age_months"] == 48
    assert response["question_count"] == 18
    assert len(response["milestones"]) == 18


def test_screening_milestones_api_for_58_months():
    """Verify the /milestones endpoint for 58 months."""
    response = screenings.get_milestones(58, user=None)

    assert response["requested_age_months"] == 58
    assert response["checkpoint_age_months"] == 48
    assert response["question_count"] == 18
    assert len(response["milestones"]) == 18

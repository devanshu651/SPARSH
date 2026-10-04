from datetime import date
from unittest.mock import patch
import unittest
from fastapi import HTTPException

from app.routers.children import age_months
from app.services.milestone_service import load_milestone_config, milestones_for_age, milestones_by_id, validate_checkpoint_answers
from app.services.scoring_engine import calculate_risk, rules
from app.models.auth import CurrentUser, Role
from app.routers import children
from app.routers import screenings
from app.models.screening import ScreeningSubmit


class ScreeningRulesTests(unittest.TestCase):
    def setUp(self):
        self.checkpoint, self.questions = milestones_for_age(12)
        self.ids = [item["id"] for item in self.questions]
        self.milestones = milestones_by_id()

    def test_checkpoint_selection_uses_current_age(self):
        self.assertEqual(milestones_for_age(13)[0], 12)
        self.assertEqual(milestones_for_age(18)[0], 18)
        self.assertEqual(milestones_for_age(0), (None, []))
        self.assertGreaterEqual(age_months(date.today()), 0)

    def test_active_set_has_exactly_65_questions_and_13_per_domain(self):
        from collections import Counter

        catalog = load_milestone_config()["milestones"]
        self.assertEqual(len(catalog), 65)
        self.assertEqual(
            Counter(item["domain"] for item in catalog),
            {
                "gross_motor": 13,
                "fine_motor": 13,
                "language": 13,
                "cognitive": 13,
                "social_emotional": 13,
            },
        )
        self.assertEqual(len({item["id"] for item in catalog}), 65)
        self.assertTrue(all(item["dataset_version"] == "phase5-final-65-v2" for item in catalog))
        self.assertTrue(all(item["age_metadata"] for item in catalog))
        self.assertLess(len(milestones_for_age(13)[1]), len(catalog))

    def test_child_milestone_api_returns_active_backend_set(self):
        class Snapshot:
            id = "child-1"

            def to_dict(self):
                return {"date_of_birth": date(2025, 9, 4), "centre_id": "centre-1"}

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
             patch.object(children, "age_months", return_value=13):
            response = children.child_milestones("child-1", worker)

        self.assertEqual(response["dataset_version"], "phase5-final-65-v2")
        self.assertEqual(response["current_age_months"], 13)
        self.assertEqual(response["checkpoint_age_months"], 12)
        self.assertEqual(response["question_count"], 5)
        self.assertEqual(response["coverage"]["target_question_count"], 13)
        self.assertEqual(response["coverage"]["shortfall"], 8)
        self.assertEqual(response["coverage"]["missing_domains"], ["fine_motor", "gross_motor"])
        self.assertEqual(len(response["milestones"]), 5)
        self.assertEqual(response["milestones"][0]["dataset_version"], "phase5-final-65-v2")

    def test_submit_rejects_previous_fixed_set_version(self):
        class Snapshot:
            id = "child-1"

            def to_dict(self):
                return {"date_of_birth": date(2025, 9, 4), "centre_id": "centre-1"}

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
        payload = ScreeningSubmit(
            child_id="child-1",
            answers=[{"milestone_id": "la_12_01", "response": "YES"}],
            checkpoint_age_months=12,
            milestone_dataset_version="phase5-final-65-v1",
            client_submission_id="stale-fixed-set",
        )
        with patch.object(screenings, "get_firestore_client", return_value=Database()), \
             patch.object(screenings, "ensure_centre_access"), \
             patch.object(screenings, "age_months", return_value=13):
            with self.assertRaises(HTTPException) as error:
                screenings.submit_screening(payload, worker)
        self.assertEqual(error.exception.status_code, 409)
        self.assertEqual(error.exception.detail["code"], "screening_checkpoint_changed")

    def test_complete_yes_result_has_all_domains_and_green_threshold(self):
        result = calculate_risk([{"milestone_id": item, "response": "YES"} for item in self.ids], self.milestones)
        self.assertEqual(result["risk_level"].value, "GREEN")
        self.assertEqual(result["total_missed_weight"], 0)
        self.assertEqual(set(result["domain_scores"]), {"gross_motor", "fine_motor", "language", "social_emotional", "cognitive"})

    def test_no_unsure_and_thresholds_remain_rule_based(self):
        no_result = calculate_risk([{"milestone_id": self.ids[0], "response": "NO"}], self.milestones)
        unsure_result = calculate_risk([{"milestone_id": self.ids[0], "response": "UNSURE"}], self.milestones)
        self.assertEqual(no_result["total_missed_weight"], 1)
        self.assertEqual(unsure_result["total_missed_weight"], .5)
        self.assertEqual(rules()["yellow_threshold"], 3)
        self.assertEqual(rules()["red_threshold"], 6)

    def test_unreachable_numeric_thresholds_are_reported_without_changing_result(self):
        checkpoint, items = milestones_for_age(60)
        result = calculate_risk(
            [{"milestone_id": items[0]["id"], "response": "NO"}],
            self.milestones,
        )
        self.assertEqual(checkpoint, 60)
        self.assertEqual(result["risk_level"].value, "GREEN")
        self.assertTrue(any("RED (6) cannot be reached" in finding for finding in result["rule_findings"]))
        self.assertTrue(any("were not assessed" in finding for finding in result["rule_findings"]))

    def test_mixed_result_keeps_zero_concern_domains(self):
        result = calculate_risk([{"milestone_id": self.ids[0], "response": "NO"}, {"milestone_id": self.ids[1], "response": "YES"}], self.milestones)
        self.assertEqual(result["domain_scores"]["fine_motor"].missed_weight, 0)

    def test_missing_unknown_and_duplicate_answers_are_rejected(self):
        with self.assertRaisesRegex(ValueError, "Missing milestones"):
            validate_checkpoint_answers(self.questions, self.ids[:-1])
        with self.assertRaisesRegex(ValueError, "not valid"):
            validate_checkpoint_answers(self.questions, self.ids[:-1] + ["unknown"])
        with self.assertRaisesRegex(ValueError, "once"):
            validate_checkpoint_answers(self.questions, self.ids + [self.ids[0]])


if __name__ == "__main__":
    unittest.main()

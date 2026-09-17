from datetime import date
import unittest

from app.routers.children import age_months
from app.services.milestone_service import milestones_for_age, milestones_by_id, validate_checkpoint_answers
from app.services.scoring_engine import calculate_risk, rules


class ScreeningRulesTests(unittest.TestCase):
    def setUp(self):
        self.checkpoint, self.questions = milestones_for_age(12)
        self.ids = [item["id"] for item in self.questions]
        self.milestones = milestones_by_id()

    def test_checkpoint_selection_uses_current_age(self):
        self.assertEqual(milestones_for_age(13)[0], 12)
        self.assertEqual(milestones_for_age(18)[0], 18)
        self.assertGreaterEqual(age_months(date.today()), 0)

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

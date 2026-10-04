import unittest
from datetime import datetime, timezone
from unittest.mock import Mock, patch
from fastapi import HTTPException

from app.ai.schemas import AssistantRequest
from app.models.auth import CurrentUser, Role
from app.routers import assistant as assistant_router
from app.ml.features import extract_features
from app.ml.evaluation import evaluate_predictions
from app.ml.predictor import UnavailablePredictor
from app.services.milestone_service import load_milestone_config, milestones_by_id, milestones_for_age
from app.services.scoring_engine import calculate_risk
from app.models.screening import ScreeningSubmit
from app.routers.screenings import history_item_from_data


class FoundationTests(unittest.TestCase):
    def test_question_bank_extension_preserves_items_and_marks_provenance(self):
        data = load_milestone_config()
        checkpoint, items = milestones_for_age(12)
        self.assertGreater(len(data["milestones"]), 20)
        domains = {item["domain"] for item in data["milestones"]}
        self.assertTrue(all(sum(item["domain"] == domain for item in data["milestones"]) > 1 for domain in domains))
        self.assertTrue(any(sum(item["domain"] == domain for item in items) > 1 for domain in domains))
        self.assertTrue(all(item["response_type"] == "YES_NO_UNSURE" for item in items))
        self.assertTrue(all(item["source_references"] for item in items))
        self.assertTrue(all(item["dataset_version"] == "phase5-final-65-v1" for item in items))
        self.assertTrue(all(item["red_flag"] is False for item in items))
        self.assertEqual(checkpoint, 12)

    def test_feature_extraction_and_unavailable_predictor(self):
        checkpoint, items = milestones_for_age(12)
        ids = [item["id"] for item in items]
        answers = [{"milestone_id": item_id, "response": "YES"} for item_id in ids]
        scores = calculate_risk(answers, milestones_by_id())
        features = extract_features(checkpoint_age_months=checkpoint, answers=answers, milestones=milestones_by_id(), domain_scores=scores["domain_scores"])
        self.assertEqual(features["response_counts"]["YES"], len(ids))
        self.assertEqual(features["milestone_responses"][ids[0]], "YES")
        self.assertEqual(UnavailablePredictor().predict(features).status, "unavailable")
        self.assertEqual(evaluate_predictions([0, 1], [0, 1])["clinical_validity"], "not_assessed")

    def test_explicit_red_flag_remains_rule_authoritative(self):
        _, items = milestones_for_age(12)
        catalog = {key: dict(value) for key, value in milestones_by_id().items()}
        flagged = items[0]["id"]
        catalog[flagged]["red_flag"] = True
        result = calculate_risk([{"milestone_id": flagged, "response": "NO"}], catalog)
        self.assertEqual(result["risk_level"].value, "RED")
        self.assertEqual(result["red_flag_ids"], [flagged])

    def test_optional_risk_factor_association_is_carried_without_changing_threshold(self):
        _, items = milestones_for_age(12)
        catalog = {key: dict(value) for key, value in milestones_by_id().items()}
        item_id = items[0]["id"]
        catalog[item_id]["risk_factor_ids"] = ["configured_factor"]
        result = calculate_risk([{"milestone_id": item_id, "response": "NO"}], catalog)
        self.assertEqual(result["risk_factor_ids"], ["configured_factor"])
        self.assertEqual(result["risk_level"].value, "GREEN")

    def test_existing_audio_visual_observation_payload_is_typed_and_preserved(self):
        payload = ScreeningSubmit(
            child_id="child-1",
            answers=[{"milestone_id": "item-1", "response": "YES"}],
            checkpoint_age_months=12,
            milestone_dataset_version="draft-1",
            client_submission_id="submission-1",
            av_observation={"hearing": "responded", "visual": "unsure", "observed_at": "2026-09-30T12:00:00Z"},
        )
        self.assertEqual(payload.model_dump(mode="json")["av_observation"]["hearing"], "responded")

    def test_longitudinal_history_resolves_only_matching_dataset_question_text(self):
        record = {"screened_at": datetime.now(timezone.utc), "risk_level": "YELLOW", "total_missed_weight": 1, "milestone_dataset_version": "draft-1", "answers": [{"milestone_id": "m1", "response": "NO"}]}
        catalog = {"m1": {"domain": "language", "question": "Existing configured question"}}
        current = history_item_from_data("s1", record, "draft-1", catalog)
        old = history_item_from_data("s2", record | {"milestone_dataset_version": "older"}, "draft-1", catalog)
        self.assertEqual(current.missed_milestones[0]["text"], "Existing configured question")
        self.assertEqual(old.missed_milestones, [])

    def test_assistant_reports_unconfigured_instead_of_generating_a_response(self):
        screening_snapshot = Mock()
        screening_snapshot.to_dict.return_value = {"child_id": "child-1"}
        screening_doc = Mock()
        screening_doc.get.return_value = screening_snapshot
        child_snapshot = Mock(id="child-1")
        child_snapshot.to_dict.return_value = {"centre_id": "centre-1"}
        child_doc = Mock()
        child_doc.get.return_value = child_snapshot
        db = Mock()
        db.collection.return_value.document.side_effect = [screening_doc, child_doc]
        user = CurrentUser(uid="worker-1", role=Role.WORKER, centre_ids=["centre-1"])
        request = AssistantRequest(screening_id="screening-1", action="explain_result")

        with patch.object(assistant_router, "get_firestore_client", return_value=db), patch.object(assistant_router, "audit_log"):
            with self.assertRaises(HTTPException) as result:
                assistant_router.assistant_response(request, user)

        self.assertEqual(result.exception.status_code, 503)
        self.assertIn("not configured", result.exception.detail)


if __name__ == "__main__":
    unittest.main()

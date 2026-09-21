from datetime import date, datetime, timezone
from unittest.mock import Mock, patch

import pytest
from fastapi import HTTPException
from firebase_admin import firestore

from app.core import audit
from app.models.auth import CurrentUser, Role
from app.models.child import ChildCreate, HealthDataCreate
from app.models.referral import ReferralCreate
from app.models.screening import DomainScore, ResponseChoice, RiskLevel, ScreeningAnswer, ScreeningSubmit
from app.routers import children, referrals, screenings


def _user():
    return CurrentUser(uid="u1", role=Role.WORKER, centre_ids=["centre-a"])


def _with_audit_db(db):
    return patch.object(audit, "get_firestore_client", return_value=db)


# ---------------------------------------------------------------------------
# audit_log unit tests
# ---------------------------------------------------------------------------

def test_allowed_action_writes_expected_fields():
    db = Mock()
    with _with_audit_db(db):
        audit.audit_log("u1", "child_created", "child-1", "centre-a")
    db.collection.assert_called_once_with("audit_logs")
    record = db.collection("audit_logs").add.call_args[0][0]
    assert record == {
        "uid": "u1",
        "action": "child_created",
        "resource_id": "child-1",
        "centre_id": "centre-a",
        "timestamp": firestore.SERVER_TIMESTAMP,
    }


def test_timestamp_uses_server_timestamp():
    db = Mock()
    with _with_audit_db(db):
        audit.audit_log("u1", "screening_submitted", "s1", "centre-a")
    assert db.collection("audit_logs").add.call_args[0][0]["timestamp"] is firestore.SERVER_TIMESTAMP


def test_centre_id_omitted_when_absent():
    db = Mock()
    with _with_audit_db(db):
        audit.audit_log("u1", "child_created", "child-1", None)
    record = db.collection("audit_logs").add.call_args[0][0]
    assert "centre_id" not in record


def test_no_pii_or_payload_written():
    db = Mock()
    with _with_audit_db(db):
        audit.audit_log("u1", "referral_created", "r1", "centre-a")
    record = db.collection("audit_logs").add.call_args[0][0]
    assert set(record.keys()) == {"uid", "action", "resource_id", "centre_id", "timestamp"}
    assert not any(k in record for k in ("name", "dob", "answers", "notes", "payload", "token", "password"))


def test_disallowed_action_raises():
    db = Mock()
    with _with_audit_db(db):
        with pytest.raises(ValueError):
            audit.audit_log("u1", "bogus_action", "child-1", "centre-a")
    db.collection.assert_not_called()


def test_invalid_uid_or_resource_id_raises():
    db = Mock()
    with _with_audit_db(db):
        with pytest.raises(ValueError):
            audit.audit_log("", "child_created", "child-1", "centre-a")
        with pytest.raises(ValueError):
            audit.audit_log("u1", "child_created", "", "centre-a")
    db.collection.assert_not_called()


def test_write_failure_does_not_raise():
    db = Mock()
    db.collection("audit_logs").add.side_effect = RuntimeError("firestore down")
    with _with_audit_db(db):
        audit.audit_log("u1", "child_created", "child-1", "centre-a")


def test_client_failure_does_not_raise():
    with patch.object(audit, "get_firestore_client", side_effect=RuntimeError("no client")):
        audit.audit_log("u1", "child_created", "child-1", "centre-a")


# ---------------------------------------------------------------------------
# Integration tests: audit invoked only after successful core operation
# ---------------------------------------------------------------------------

def test_child_creation_invokes_audit_after_success():
    payload = ChildCreate(
        name="Asha", date_of_birth=date(2024, 1, 1),
        child_identifier="CH-1", centre_id="centre-a", centre_name="Centre A",
    )
    created = payload.model_dump() | {
        "centre_name": "Canonical Centre", "age_months": 12,
        "created_at": datetime.now(timezone.utc), "created_by": "u1",
    }
    audit_db = Mock()
    with patch.object(children, "_register_child_in_transaction", return_value=("child-1", created)), \
         patch.object(children, "get_firestore_client", return_value=Mock()), \
         _with_audit_db(audit_db):
        result = children.register_child(payload, _user())
    assert result.id == "child-1"
    record = audit_db.collection("audit_logs").add.call_args[0][0]
    assert record["uid"] == "u1"
    assert record["action"] == "child_created"
    assert record["resource_id"] == "child-1"
    assert record["centre_id"] == "centre-a"
    assert record["timestamp"] is firestore.SERVER_TIMESTAMP


def test_unauthorized_child_creation_no_audit():
    payload = ChildCreate(
        name="Asha", date_of_birth=date(2024, 1, 1),
        child_identifier="CH-1", centre_id="centre-b",
    )
    audit_db = Mock()
    with _with_audit_db(audit_db):
        with pytest.raises(HTTPException) as exc:
            children.register_child(payload, _user())
    assert exc.value.status_code == 403
    audit_db.collection("audit_logs").add.assert_not_called()


def test_health_data_invokes_audit_after_write():
    child = {"id": "child-1", "centre_id": "centre-a", "name": "Asha", "date_of_birth": date(2024, 1, 1), "child_identifier": "CH-1", "centre_name": "Centre A", "age_months": 12, "created_at": datetime.now(timezone.utc), "created_by": "u1"}
    data_db = Mock()
    snap = Mock()
    snap.to_dict.return_value = child
    snap.id = "child-1"
    data_db.collection("children").document("child-1").get.return_value = snap
    ref = Mock()
    ref.id = "health-1"
    data_db.collection("children").document("child-1").collection("health_data").document.return_value = ref
    audit_db = Mock()
    with patch.object(children, "get_firestore_client", return_value=data_db), \
         _with_audit_db(audit_db):
        result = children.record_health_data("child-1", HealthDataCreate(measured_on=date(2024, 2, 1), weight_kg=10.0), _user())
    assert result.id == "health-1"
    record = audit_db.collection("audit_logs").add.call_args[0][0]
    assert record["action"] == "health_data_created"
    assert record["resource_id"] == "child-1"
    assert record["centre_id"] == "centre-a"


def test_screening_invokes_audit_after_write():
    child = {"id": "child-1", "centre_id": "centre-a", "name": "Asha", "date_of_birth": date(2024, 1, 1), "child_identifier": "CH-1", "centre_name": "Centre A", "age_months": 12, "created_at": datetime.now(timezone.utc), "created_by": "u1"}
    child_snap = Mock(to_dict=lambda: child, id="child-1")
    children_collection = Mock()
    children_collection.document.return_value.get.return_value = child_snap
    screening_ref = Mock(id="screening-1")
    screenings_collection = Mock()
    screenings_collection.document.return_value = screening_ref
    screenings_collection.where.return_value.stream.return_value = []
    data_db = Mock()
    data_db.collection.side_effect = lambda name: {"children": children_collection, "screenings": screenings_collection}[name]
    audit_db = Mock()
    with patch.object(screenings, "get_firestore_client", return_value=data_db), \
         patch.object(screenings, "milestones_for_age", return_value=(12, [{"id": "m1"}])), \
         patch.object(screenings, "milestones_by_id", return_value={"m1": Mock(weight=1)}), \
         patch.object(screenings, "validate_checkpoint_answers", return_value=None), \
             patch.object(screenings, "calculate_risk", return_value={"risk_level": RiskLevel.GREEN, "risk_label": "LOW", "total_missed_weight": 0.0, "domain_scores": {"gross_motor": DomainScore(missed_weight=0.0, missed_count=0, unsure_count=0, status="OK")}, "recommendation": "ok"}), \
         patch.object(screenings, "load_milestone_config", return_value={"version": "draft-1"}), \
         _with_audit_db(audit_db):
        payload = ScreeningSubmit(
            child_id="child-1",
            answers=[ScreeningAnswer(milestone_id="m1", response=ResponseChoice.YES)],
            checkpoint_age_months=12,
            milestone_dataset_version="draft-1",
            client_submission_id="cs-1",
            screened_at=datetime.now(timezone.utc),
        )
        result = screenings.submit_screening(payload, _user())
    assert result.screening_id == "screening-1"
    record = audit_db.collection("audit_logs").add.call_args[0][0]
    assert record["action"] == "screening_submitted"
    assert record["resource_id"] == "screening-1"
    assert record["centre_id"] == "centre-a"


def test_duplicate_screening_409_no_audit():
    child = {"id": "child-1", "centre_id": "centre-a", "name": "Asha", "date_of_birth": date(2024, 1, 1), "child_identifier": "CH-1", "centre_name": "Centre A", "age_months": 12, "created_at": datetime.now(timezone.utc), "created_by": "u1"}
    data_db = Mock()
    snap = Mock()
    snap.to_dict.return_value = child
    snap.id = "child-1"
    data_db.collection("children").document("child-1").get.return_value = snap
    data_db.collection("screenings").where.return_value.stream.return_value = [Mock()]
    audit_db = Mock()
    with patch.object(screenings, "get_firestore_client", return_value=data_db), \
         _with_audit_db(audit_db):
        with pytest.raises(HTTPException) as exc:
            screenings.submit_screening(
                ScreeningSubmit(
                    child_id="child-1",
                    answers=[ScreeningAnswer(milestone_id="m1", response=ResponseChoice.YES)],
                    checkpoint_age_months=12,
                    milestone_dataset_version="draft-1",
                    client_submission_id="cs-1",
                    screened_at=datetime.now(timezone.utc),
                ),
                _user(),
            )
    assert exc.value.status_code == 409
    audit_db.collection("audit_logs").add.assert_not_called()


def test_referral_invokes_audit_after_write():
    child = {"id": "child-1", "centre_id": "centre-a", "name": "Asha", "date_of_birth": date(2024, 1, 1), "child_identifier": "CH-1", "centre_name": "Centre A", "age_months": 12, "created_at": datetime.now(timezone.utc), "created_by": "u1"}
    screening = {"risk_level": "RED", "child_id": "child-1", "domain_scores": {}}
    screenings_collection = Mock()
    screenings_collection.document.return_value.get.return_value = Mock(to_dict=lambda: screening)
    child_snap = Mock(to_dict=lambda: child, id="child-1")
    children_collection = Mock()
    children_collection.document.return_value.get.return_value = child_snap
    referral_ref = Mock()
    referral_ref.id = "referral-1"
    referrals_collection = Mock()
    referrals_collection.document.return_value = referral_ref
    data_db = Mock()
    data_db.collection.side_effect = lambda name: {"screenings": screenings_collection, "children": children_collection, "referrals": referrals_collection}[name]
    audit_db = Mock()
    with patch.object(referrals, "get_firestore_client", return_value=data_db), \
         _with_audit_db(audit_db):
        result = referrals.generate_referral(
            ReferralCreate(screening_id="screening-1", facility_name="City Hospital"),
            _user(),
        )
    assert result.referral_id == "referral-1"
    record = audit_db.collection("audit_logs").add.call_args[0][0]
    assert record["action"] == "referral_created"
    assert record["resource_id"] == "referral-1"
    assert record["centre_id"] == "centre-a"


def test_non_red_referral_409_no_audit():
    child = {"id": "child-1", "centre_id": "centre-a", "name": "Asha", "date_of_birth": date(2024, 1, 1), "child_identifier": "CH-1", "centre_name": "Centre A", "age_months": 12, "created_at": datetime.now(timezone.utc), "created_by": "u1"}
    screening = {"risk_level": "YELLOW", "child_id": "child-1"}
    data_db = Mock()
    data_db.collection("screenings").document("screening-1").get.return_value = Mock(to_dict=lambda: screening)
    audit_db = Mock()
    with patch.object(referrals, "get_firestore_client", return_value=data_db), \
         _with_audit_db(audit_db):
        with pytest.raises(HTTPException) as exc:
            referrals.generate_referral(
                ReferralCreate(screening_id="screening-1", facility_name="City Hospital"),
                _user(),
            )
    assert exc.value.status_code == 409
    audit_db.collection("audit_logs").add.assert_not_called()

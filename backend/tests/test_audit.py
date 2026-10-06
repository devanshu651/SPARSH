from datetime import date, datetime, timezone
from unittest.mock import Mock, patch

import pytest
from fastapi import HTTPException
from firebase_admin import firestore

from app.core import audit
from app.models.auth import CurrentUser, Role
from app.models.child import ChildCreate, HealthDataCreate
from app.models.centre import CentreCreate, CentreUpdate
from app.models.referral import ReferralCreate
from app.models.screening import DomainScore, ResponseChoice, RiskLevel, ScreeningAnswer, ScreeningSubmit
from app.routers import centres, children, referrals, screenings


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


@pytest.mark.parametrize("action", [
    "user_provisioned", "user_updated", "user_activation_changed",
    "centre_created", "centre_updated",
])
def test_admin_operation_audit_actions_keep_metadata_only(action):
    db = Mock()
    with _with_audit_db(db):
        audit.audit_log("admin-1", action, "resource-1", "centre-a")
    record = db.collection("audit_logs").add.call_args.args[0]
    assert record == {
        "uid": "admin-1",
        "action": action,
        "resource_id": "resource-1",
        "centre_id": "centre-a",
        "timestamp": firestore.SERVER_TIMESTAMP,
    }


def test_centre_create_and_update_emit_audit_events():
    centre_payload = CentreCreate(code="AWC-1", name="Centre", district="District", state="State", address="Address")
    centre_data = centre_payload.model_dump() | {
        "active": True,
        "created_at": datetime.now(timezone.utc),
        "created_by": "admin-1",
    }
    with patch.object(centres, "get_firestore_client", return_value=Mock()), \
         patch.object(centres, "_create_centre_in_transaction", return_value="centre-1"), \
         patch.object(centres, "audit_log") as audit_event:
        created = centres.create_centre(centre_payload, CurrentUser(uid="admin-1", role=Role.ADMIN))
    assert created.id == "centre-1"
    audit_event.assert_called_once_with("admin-1", "centre_created", "centre-1", "centre-1")

    db = Mock()
    snapshot = Mock(to_dict=lambda: centre_data, id="centre-1")
    db.collection.return_value.document.return_value.get.return_value = snapshot
    db.collection.return_value.document.return_value.update.return_value = None
    with patch.object(centres, "get_firestore_client", return_value=db), \
         patch.object(centres, "audit_log") as audit_event:
        updated = centres.update_centre("centre-1", CentreUpdate(active=False), CurrentUser(uid="admin-1", role=Role.ADMIN))
    assert updated.id == "centre-1"
    audit_event.assert_called_once_with("admin-1", "centre_updated", "centre-1", "centre-1")


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


def test_write_failure_does_not_raise_or_log_exception_details(caplog):
    db = Mock()
    db.collection("audit_logs").add.side_effect = RuntimeError("private child details")
    with _with_audit_db(db):
        audit.audit_log("u1", "child_created", "child-1", "centre-a")
    assert "private child details" not in caplog.text
    assert "resource_id=child-1" not in caplog.text


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


def test_assistant_request_is_audited_without_child_details():
    db = Mock()
    with _with_audit_db(db):
        audit.audit_log("u1", "assistant_requested", "screening-1", "centre-a")
    record = db.collection("audit_logs").add.call_args[0][0]
    assert record["action"] == "assistant_requested"
    assert record["resource_id"] == "screening-1"
    assert "child_name" not in record
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
    screenings_collection.where.return_value.limit.return_value.stream.return_value = []
    screenings_collection.where.return_value.stream.return_value = []
    submission_ref = Mock()
    submission_ref.get.return_value.exists = False
    submissions_collection = Mock()
    submissions_collection.document.return_value = submission_ref
    data_db = Mock()
    data_db.collection.side_effect = lambda name: {"children": children_collection, "screenings": screenings_collection, "screening_submissions": submissions_collection}[name]
    audit_db = Mock()
    with patch.object(screenings.firestore, "transactional", side_effect=lambda function: function), \
         patch.object(screenings, "get_firestore_client", return_value=data_db), \
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
    data_db.transaction.return_value.create.assert_called_once()
    data_db.transaction.return_value.set.assert_called_once()
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
    data_db.collection("screenings").where.return_value.limit.return_value.stream.return_value = [Mock()]
    audit_db = Mock()
    with patch.object(screenings, "get_firestore_client", return_value=data_db), \
         patch.object(screenings, "age_months", return_value=12), \
         patch.object(screenings, "milestones_for_age", return_value=(12, [])), \
         patch.object(screenings, "validate_checkpoint_answers", return_value=None), \
         patch.object(screenings, "load_milestone_config", return_value={"version": "draft-1"}), \
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
    assert exc.value.detail["code"] == "duplicate_submission"
    audit_db.collection("audit_logs").add.assert_not_called()


def test_checkpoint_conflict_has_distinct_code_from_duplicate_submission():
    child = {"id": "child-1", "centre_id": "centre-a", "date_of_birth": date(2024, 1, 1)}
    data_db = Mock()
    data_db.collection("children").document.return_value.get.return_value = Mock(to_dict=lambda: child, id="child-1")
    payload = ScreeningSubmit(
        child_id="child-1",
        answers=[ScreeningAnswer(milestone_id="m1", response=ResponseChoice.YES)],
        checkpoint_age_months=12,
        milestone_dataset_version="draft-1",
        client_submission_id="cs-1",
    )
    with patch.object(screenings, "get_firestore_client", return_value=data_db), \
         patch.object(screenings, "age_months", return_value=13), \
         patch.object(screenings, "milestones_for_age", return_value=(18, [])), \
         patch.object(screenings, "load_milestone_config", return_value={"version": "draft-1"}):
        with pytest.raises(HTTPException) as error:
            screenings.submit_screening(payload, _user())
    assert error.value.status_code == 409
    assert error.value.detail["code"] == "screening_checkpoint_changed"


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
    referrals_collection.where.return_value.limit.return_value.stream.return_value = []
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
    referral_ref.create.assert_called_once()
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
    assert exc.value.detail["code"] == "referral_requires_red_screening"
    audit_db.collection("audit_logs").add.assert_not_called()


def test_duplicate_referral_is_rejected_without_audit():
    child = {"id": "child-1", "centre_id": "centre-a", "date_of_birth": date(2024, 1, 1)}
    screening = {"risk_level": "RED", "child_id": "child-1", "domain_scores": {}}
    data_db = Mock()
    screenings_collection = Mock()
    screenings_collection.document.return_value.get.return_value = Mock(to_dict=lambda: screening)
    children_collection = Mock()
    children_collection.document.return_value.get.return_value = Mock(to_dict=lambda: child, id="child-1")
    referrals_collection = Mock()
    referrals_collection.where.return_value.limit.return_value.stream.return_value = [Mock()]
    data_db.collection.side_effect = lambda name: {
        "screenings": screenings_collection,
        "children": children_collection,
        "referrals": referrals_collection,
    }[name]
    audit_db = Mock()
    with patch.object(referrals, "get_firestore_client", return_value=data_db), \
         _with_audit_db(audit_db):
        with pytest.raises(HTTPException) as error:
            referrals.generate_referral(
                ReferralCreate(screening_id="screening-1", facility_name="City Hospital"),
                _user(),
            )
    assert error.value.status_code == 409
    assert error.value.detail["code"] == "duplicate_referral"
    audit_db.collection("audit_logs").add.assert_not_called()

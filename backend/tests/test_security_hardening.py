from datetime import date, timedelta
from unittest.mock import Mock, patch

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import ValidationError

from app.core import security
from app.models.auth import CurrentUser, Role
from app.models.centre import CentreCreate, CentreUpdate
from app.models.child import ChildCreate, HealthDataCreate
from app.models.screening import ScreeningSubmit
from app.routers import children


def credentials() -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")


def firestore_for(profile: dict | None):
    snapshot = Mock()
    snapshot.to_dict.return_value = profile
    document = Mock()
    document.get.return_value = snapshot
    collection = Mock()
    collection.document.return_value = document
    db = Mock()
    db.collection.return_value = collection
    return db


def test_missing_credentials_is_401():
    with pytest.raises(HTTPException) as error:
        security.get_current_user(None)
    assert error.value.status_code == 401


@pytest.mark.parametrize("failure", [RuntimeError("invalid"), RuntimeError("revoked"), RuntimeError("disabled")])
def test_token_failures_are_clean_401(failure):
    with patch.object(security.auth, "verify_id_token", side_effect=failure):
        with pytest.raises(HTTPException) as error:
            security.get_current_user(credentials())
    assert error.value.status_code == 401


def test_profile_is_authoritative_over_token_claims():
    db = firestore_for({"role": "worker", "name": "Profile Name", "centre_ids": ["centre-a"]})
    with patch.object(security.auth, "verify_id_token", return_value={"uid": "u1", "role": "admin", "centre_ids": ["other"]}) as verify, patch.object(security, "get_firestore_client", return_value=db):
        user = security.get_current_user(credentials())
    verify.assert_called_once_with("token", check_revoked=True)
    assert user == CurrentUser(uid="u1", role=Role.WORKER, name="Profile Name", centre_ids=["centre-a"])


@pytest.mark.parametrize("profile", [
    {"role": "not-a-role", "centre_ids": []},
    {"role": "worker", "centre_ids": "centre-a"},
    {"role": "worker", "centre_ids": [" "]},
    None,
])
def test_malformed_profile_claims_are_401(profile):
    with patch.object(security.auth, "verify_id_token", return_value={"uid": "u1"}), patch.object(security, "get_firestore_client", return_value=firestore_for(profile)):
        with pytest.raises(HTTPException) as error:
            security.get_current_user(credentials())
    assert error.value.status_code == 401


def test_profile_centre_assignments_are_used_for_access():
    db = firestore_for({"role": "supervisor", "centre_ids": [" centre-a "]})
    with patch.object(security.auth, "verify_id_token", return_value={"uid": "u1", "centre_ids": ["centre-b"]}), patch.object(security, "get_firestore_client", return_value=db):
        user = security.get_current_user(credentials())
    security.ensure_centre_access(user, "centre-a")
    with pytest.raises(HTTPException):
        security.ensure_centre_access(user, "centre-b")


def test_centre_code_normalizes_and_rejects_extra_fields():
    centre = CentreCreate(code=" awc-12 ", name=" Centre ", district="D", state="S", address="A")
    assert centre.code == "AWC-12"
    assert centre.name == "Centre"
    with pytest.raises(ValidationError):
        CentreCreate(code="AWC", name="Centre", district="D", state="S", address="A", unknown=True)
    with pytest.raises(ValidationError):
        CentreUpdate(unknown=True)


@pytest.mark.parametrize("kwargs", [
    {"name": " ", "date_of_birth": date.today(), "child_identifier": "x", "centre_id": "centre-a"},
    {"name": "A", "date_of_birth": date.today() + timedelta(days=1), "child_identifier": "x", "centre_id": "centre-a"},
    {"name": "A", "date_of_birth": date.today(), "child_identifier": " ", "centre_id": "centre-a"},
    {"name": "A", "date_of_birth": date.today(), "child_identifier": "x", "centre_id": "centre/a"},
])
def test_child_validation_rejects_invalid_required_values(kwargs):
    with pytest.raises(ValidationError):
        ChildCreate(**kwargs)


def test_health_and_screening_requests_forbid_extra_or_blank_fields():
    with pytest.raises(ValidationError):
        HealthDataCreate(measured_on=date.today() + timedelta(days=1))
    with pytest.raises(ValidationError):
        ScreeningSubmit(child_id=" ", answers=[], checkpoint_age_months=0, milestone_dataset_version="v1", client_submission_id="id")


def test_client_centre_name_is_replaced_by_transaction_result():
    payload = ChildCreate(name="Asha", date_of_birth=date(2024, 1, 1), child_identifier="CH-1", centre_id="centre-a", centre_name="Attacker name")
    created = payload.model_dump() | {"centre_name": "Canonical Centre", "age_months": 12, "created_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc), "created_by": "u1"}
    with patch.object(children, "get_firestore_client", return_value=Mock()), patch.object(children, "_register_child_in_transaction", return_value=("child-1", created)):
        result = children.register_child(payload, CurrentUser(uid="u1", role=Role.WORKER, centre_ids=["centre-a"]))
    assert result.centre_name == "Canonical Centre"


def test_inactive_centre_registration_is_rejected_before_write():
    class Snapshot:
        id = "centre-a"

        def to_dict(self):
            return {"name": "Centre A", "active": False}

    class Ref:
        id = "child-1"

        def get(self, transaction=None):
            return Snapshot()

    class Transaction:
        def set(self, *args):
            raise AssertionError("inactive centre must not write")

    class Collection:
        def document(self, identifier=None):
            return Ref()

    class Db:
        def collection(self, name):
            return Collection()

        def transaction(self):
            return Transaction()

    payload = ChildCreate(name="Asha", date_of_birth=date(2024, 1, 1), child_identifier="CH-1", centre_id="centre-a")
    with patch.object(children.firestore, "transactional", side_effect=lambda function: function):
        with pytest.raises(HTTPException, match="inactive") as error:
            children._register_child_in_transaction(Db(), payload, CurrentUser(uid="u1", role=Role.WORKER, centre_ids=["centre-a"]))
    assert error.value.status_code == 409

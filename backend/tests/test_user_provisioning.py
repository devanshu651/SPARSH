from datetime import datetime, timezone
from unittest.mock import Mock, patch

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.models.auth import CurrentUser, Role, UserProvision, UserUpdate
from app.routers import users


ADMIN = CurrentUser(uid="admin-1", role=Role.ADMIN, name="Admin")
WORKER = CurrentUser(uid="worker-1", role=Role.WORKER, name="Worker")
SUPERVISOR = CurrentUser(uid="supervisor-1", role=Role.SUPERVISOR, name="Supervisor")


class Snapshot:
    def __init__(self, data, identifier="centre-a"):
        self.data = data
        self.id = identifier

    def to_dict(self):
        return self.data


def provisioning_db(centre_active=True):
    profile_ref = Mock()
    centre_ref = Mock()
    centre_ref.get.return_value = Snapshot({"active": centre_active})
    centres = Mock()
    centres.document.return_value = centre_ref
    profiles = Mock()
    profiles.document.return_value = profile_ref
    db = Mock()
    db.collection.side_effect = lambda name: centres if name == "centres" else profiles
    return db, profile_ref


@pytest.fixture(autouse=True)
def plain_transaction_decorator():
    with patch.object(users.firestore, "transactional", side_effect=lambda function: function):
        yield


def payload(**overrides):
    values = {"name": "Asha Worker", "mobile": "98765 43210", "password": "safe-password", "role": Role.WORKER, "centre_ids": ["centre-a"]}
    values.update(overrides)
    return UserProvision(**values)


def test_admin_can_provision_worker_and_password_is_not_persisted():
    db, profile_ref = provisioning_db()
    firebase_user = Mock(uid="uid-1", disabled=False)
    with patch.object(users, "get_firestore_client", return_value=db), patch.object(users.auth, "create_user", return_value=firebase_user) as create:
        response = users.provision_user(payload(), ADMIN)
    create.assert_called_once_with(email="9876543210@sparsh.local", password="safe-password", display_name="Asha Worker")
    written = db.transaction.return_value.set.call_args.args[1]
    assert "password" not in written
    assert response.uid == "uid-1"
    assert response.role is Role.WORKER


def test_admin_can_provision_supervisor():
    db, _ = provisioning_db()
    firebase_user = Mock(uid="uid-2", disabled=False)
    provision = payload(role=Role.SUPERVISOR)
    with patch.object(users, "get_firestore_client", return_value=db), patch.object(users.auth, "create_user", return_value=firebase_user):
        assert users.provision_user(provision, ADMIN).role is Role.SUPERVISOR


@pytest.mark.parametrize("caller", [WORKER, SUPERVISOR])
def test_non_admin_role_guard_denies_provisioning(caller):
    guard = __import__("app.core.security", fromlist=["require_roles"]).require_roles(Role.ADMIN)
    with pytest.raises(HTTPException) as error:
        guard(caller)
    assert error.value.status_code == 403


@pytest.mark.parametrize("invalid", [
    {"mobile": "123"},
    {"name": " "},
    {"role": Role.ADMIN},
    {"centre_ids": ["centre-a", "centre-a"]},
    {"unknown": "field"},
])
def test_provisioning_validation(invalid):
    with pytest.raises(ValidationError):
        payload(**invalid)


def test_nonexistent_and_inactive_centres_are_rejected():
    db, _ = provisioning_db()
    db.collection("centres").document("centre-a").get.return_value = Snapshot(None)
    with patch.object(users, "get_firestore_client", return_value=db):
        with pytest.raises(HTTPException, match="not found"):
            users.provision_user(payload(), ADMIN)
    db, _ = provisioning_db(centre_active=False)
    with patch.object(users, "get_firestore_client", return_value=db):
        with pytest.raises(HTTPException, match="inactive"):
            users.provision_user(payload(), ADMIN)


def test_profile_failure_compensates_by_deleting_auth_account():
    db, profile_ref = provisioning_db()
    db.transaction.return_value.set.side_effect = RuntimeError("firestore unavailable")
    firebase_user = Mock(uid="uid-3", disabled=False)
    with patch.object(users, "get_firestore_client", return_value=db), patch.object(users.auth, "create_user", return_value=firebase_user), patch.object(users.auth, "delete_user") as delete:
        with pytest.raises(HTTPException) as error:
            users.provision_user(payload(), ADMIN)
    assert error.value.status_code == 500
    delete.assert_called_once_with("uid-3")


def test_admin_can_update_assignments_role_and_activation():
    db, profile_ref = provisioning_db()
    profile_ref.get.return_value = Snapshot({"name": "Asha", "role": "worker", "centre_ids": ["centre-a"], "created_at": datetime.now(timezone.utc)}, "uid-1")
    firebase_user = Mock(disabled=False)
    with patch.object(users, "get_firestore_client", return_value=db), patch.object(users.auth, "get_user", return_value=firebase_user), patch.object(users.auth, "update_user", return_value=Mock(disabled=True)):
        updated = users.update_user("uid-1", UserUpdate(role=Role.SUPERVISOR, centre_ids=[]), ADMIN)
        activated = users.set_user_activation("uid-1", __import__("app.models.auth", fromlist=["UserActivationUpdate"]).UserActivationUpdate(disabled=True), ADMIN)
    assert updated.role is Role.SUPERVISOR
    assert db.transaction.return_value.update.call_args.args[1]["centre_ids"] == []
    assert activated.disabled is True


def admin_safety_db(other_disabled=False):
    current = Snapshot({"name": "Admin One", "role": "admin", "centre_ids": []}, "admin-1")
    other = Snapshot({"name": "Admin Two", "role": "admin", "centre_ids": []}, "admin-2")
    users_collection = Mock()
    users_collection.where.return_value = Mock()
    safety_collection = Mock()
    db = Mock()
    db.collection.side_effect = lambda name: users_collection if name == "users" else safety_collection
    db.transaction.return_value.get.return_value = [current, other]
    firebase_users = {
        "admin-1": Mock(disabled=False),
        "admin-2": Mock(disabled=other_disabled),
    }
    return db, firebase_users


@pytest.mark.parametrize("disabling,new_role", [(True, None), (False, Role.WORKER)])
def test_cannot_remove_final_active_admin(disabling, new_role):
    db, firebase_users = admin_safety_db(other_disabled=True)
    with patch.object(users.auth, "get_user", side_effect=lambda uid: firebase_users[uid]):
        with pytest.raises(HTTPException, match="last active administrator") as error:
            users._ensure_not_removing_last_active_admin(db, "admin-1", {"role": "admin"}, disabling=disabling, new_role=new_role)
    assert error.value.status_code == 409


@pytest.mark.parametrize("disabling,new_role", [(True, None), (False, Role.WORKER)])
def test_can_remove_admin_when_another_active_admin_exists(disabling, new_role):
    db, firebase_users = admin_safety_db(other_disabled=False)
    with patch.object(users.auth, "get_user", side_effect=lambda uid: firebase_users[uid]):
        users._ensure_not_removing_last_active_admin(db, "admin-1", {"role": "admin"}, disabling=disabling, new_role=new_role)
    assert db.transaction.return_value.set.called


def test_transactional_profile_write_rejects_centre_deactivated_during_write():
    db, profile_ref = provisioning_db(centre_active=False)
    with pytest.raises(HTTPException, match="inactive"):
        users._write_profile_with_active_centres(db, "uid-1", {"centre_ids": ["centre-a"]}, create=False)
    assert not db.transaction.return_value.update.called


def test_missing_auth_account_does_not_modify_profile():
    db, profile_ref = provisioning_db()
    profile_ref.get.return_value = Snapshot({"name": "Asha", "role": "worker", "centre_ids": []}, "uid-1")
    with patch.object(users, "get_firestore_client", return_value=db), patch.object(users.auth, "get_user", side_effect=RuntimeError("missing")):
        with pytest.raises(HTTPException) as error:
            users.update_user("uid-1", UserUpdate(name="Updated"), ADMIN)
    assert error.value.status_code == 404
    assert not db.transaction.return_value.update.called

from datetime import date, datetime, timezone
from unittest.mock import patch

import pytest
from fastapi import HTTPException

from app.core.security import ensure_centre_access
from app.models.auth import CurrentUser, Role
from app.models.child import ChildCreate
from app.routers import children


def user(role: Role, centre_ids: list[str] | None = None) -> CurrentUser:
    return CurrentUser(uid="user-1", role=role, centre_ids=centre_ids or [])


def test_admin_can_access_any_centre():
    ensure_centre_access(user(Role.ADMIN), "any-centre")


def test_worker_can_access_an_assigned_centre():
    ensure_centre_access(user(Role.WORKER, ["centre-a"]), "centre-a")


def test_worker_cannot_access_another_centre():
    with pytest.raises(HTTPException, match="not authorized") as error:
        ensure_centre_access(user(Role.WORKER, ["centre-a"]), "centre-b")
    assert error.value.status_code == 403


def test_supervisor_can_access_each_assigned_centre():
    supervisor = user(Role.SUPERVISOR, ["centre-a", "centre-b"])
    ensure_centre_access(supervisor, "centre-a")
    ensure_centre_access(supervisor, "centre-b")


def test_unauthorized_centre_registration_is_rejected_before_writing():
    payload = ChildCreate(
        name="Asha",
        date_of_birth=date(2024, 1, 1),
        child_identifier="CH-1",
        centre_id="centre-b",
    )
    with pytest.raises(HTTPException, match="not authorized") as error:
        children.register_child(payload, user(Role.WORKER, ["centre-a"]))
    assert error.value.status_code == 403


def test_missing_centre_assignment_rejects_registration():
    payload = ChildCreate(
        name="Asha",
        date_of_birth=date(2024, 1, 1),
        child_identifier="CH-1",
        centre_id="centre-a",
    )
    with pytest.raises(HTTPException, match="no assigned centres") as error:
        children.register_child(payload, user(Role.WORKER))
    assert error.value.status_code == 403


class Snapshot:
    id = "child-other"

    def to_dict(self):
        return {
            "name": "Asha",
            "date_of_birth": date(2024, 1, 1),
            "child_identifier": "CH-1",
            "centre_id": "centre-b",
            "centre_name": "Centre B",
            "age_months": 12,
            "created_at": datetime.now(timezone.utc),
            "created_by": "worker-b",
        }


class ChildDocument:
    def get(self):
        return Snapshot()


class ChildrenCollection:
    def document(self, child_id: str):
        assert child_id == "child-other"
        return ChildDocument()


class FakeFirestore:
    def collection(self, name: str):
        assert name == "children"
        return ChildrenCollection()


def test_child_access_is_denied_across_centres():
    with patch.object(children, "get_firestore_client", return_value=FakeFirestore()):
        with pytest.raises(HTTPException, match="not authorized") as error:
            children.get_child("child-other", user(Role.WORKER, ["centre-a"]))
    assert error.value.status_code == 403

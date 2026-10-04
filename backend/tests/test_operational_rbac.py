from inspect import signature

import pytest
from fastapi import HTTPException

from app.models.auth import CurrentUser, Role
from app.routers import assistant, centres, children, referrals, screenings, users


OPERATIONAL_ENDPOINTS = [
    children.register_child,
    children.list_children,
    children.child_milestones,
    children.get_child,
    children.record_health_data,
    children.health_history,
    screenings.get_milestones,
    screenings.submit_screening,
    screenings.get_risk_score,
    screenings.child_history,
    referrals.generate_referral,
    referrals.get_referral,
    referrals.get_referral_by_screening,
    assistant.assistant_response,
]

ADMIN_ENDPOINTS = [
    centres.create_centre,
    centres.update_centre,
    users.provision_user,
    users.list_users,
    users.get_user,
    users.update_user,
    users.set_user_activation,
]


@pytest.mark.parametrize("endpoint", OPERATIONAL_ENDPOINTS)
def test_admin_is_denied_worker_operational_endpoint(endpoint):
    guard = signature(endpoint).parameters["user"].default.dependency
    admin = CurrentUser(uid="admin-1", role=Role.ADMIN)

    with pytest.raises(HTTPException) as error:
        guard(admin)

    assert error.value.status_code == 403


@pytest.mark.parametrize("endpoint", OPERATIONAL_ENDPOINTS)
def test_worker_is_allowed_worker_operational_endpoint(endpoint):
    guard = signature(endpoint).parameters["user"].default.dependency
    worker = CurrentUser(uid="worker-1", role=Role.WORKER, centre_ids=["centre-1"])

    assert guard(worker) is worker


@pytest.mark.parametrize(
    "endpoint",
    [children.list_children, screenings.get_milestones, referrals.get_referral],
)
def test_supervisor_read_access_is_preserved(endpoint):
    guard = signature(endpoint).parameters["user"].default.dependency
    supervisor = CurrentUser(uid="supervisor-1", role=Role.SUPERVISOR, centre_ids=["centre-1"])

    assert guard(supervisor) is supervisor


@pytest.mark.parametrize("endpoint", ADMIN_ENDPOINTS)
def test_admin_is_allowed_admin_management_endpoint(endpoint):
    guard = signature(endpoint).parameters["user"].default.dependency
    admin = CurrentUser(uid="admin-1", role=Role.ADMIN)

    assert guard(admin) is admin


@pytest.mark.parametrize("endpoint", ADMIN_ENDPOINTS)
def test_worker_is_denied_admin_management_endpoint(endpoint):
    guard = signature(endpoint).parameters["user"].default.dependency
    worker = CurrentUser(uid="worker-1", role=Role.WORKER, centre_ids=["centre-1"])

    with pytest.raises(HTTPException) as error:
        guard(worker)

    assert error.value.status_code == 403

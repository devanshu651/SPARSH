from unittest.mock import patch

from unittest.mock import Mock, patch

import pytest

from app import bootstrap_admin


class FirebaseLikeError(bootstrap_admin.exceptions.FirebaseError):
    def __init__(self, message):
        super().__init__("PERMISSION_DENIED", message)

    @property
    def status_code(self):
        return 403


def test_local_diagnostic_reports_phase_and_safe_error_metadata(monkeypatch, capsys):
    monkeypatch.setenv("SPARSH_ENVIRONMENT", "local")
    failure = bootstrap_admin.BootstrapFailure(
        "Firestore users/{uid} write", FirebaseLikeError("private credential content")
    )
    with patch.object(bootstrap_admin, "bootstrap", side_effect=failure):
        assert bootstrap_admin.main() == 1

    output = capsys.readouterr().err
    assert "phase=Firestore users/{uid} write" in output
    assert "exception_type=FirebaseLikeError" in output
    assert "code=PERMISSION_DENIED" in output
    assert "status=403" in output
    assert "private credential content" not in output


def test_nonlocal_diagnostic_does_not_expose_phase_or_error_metadata(monkeypatch, capsys):
    monkeypatch.setenv("SPARSH_ENVIRONMENT", "production")
    failure = bootstrap_admin.BootstrapFailure(
        "Firebase Auth user creation", FirebaseLikeError("private credential content")
    )
    with patch.object(bootstrap_admin, "bootstrap", side_effect=failure):
        assert bootstrap_admin.main() == 1

    output = capsys.readouterr().err
    assert "phase=" not in output
    assert "PERMISSION_DENIED" not in output
    assert "private credential content" not in output


def test_local_diagnostic_includes_value_free_validation_reason(monkeypatch, capsys):
    monkeypatch.setenv("SPARSH_ENVIRONMENT", "local")
    failure = bootstrap_admin.BootstrapFailure(
        "configuration validation",
        ValueError("SPARSH_LOCAL_ADMIN_MOBILE must contain exactly 10 digits"),
    )
    with patch.object(bootstrap_admin, "bootstrap", side_effect=failure):
        assert bootstrap_admin.main() == 1

    output = capsys.readouterr().err
    assert "validation=SPARSH_LOCAL_ADMIN_MOBILE must contain exactly 10 digits" in output


def test_auth_lookup_refuses_an_existing_identity_without_mutating_auth():
    with patch.object(bootstrap_admin.auth, "get_user_by_email", return_value=object()) as lookup:
        try:
            bootstrap_admin._require_auth_email_unused("1234567890@sparsh.local")
        except bootstrap_admin.ExistingFirebaseAuthUserError as exc:
            assert bootstrap_admin._auth_lookup_reason(exc) == "already-existing-user"
        else:
            raise AssertionError("existing Auth identity was not rejected")

    lookup.assert_called_once_with("1234567890@sparsh.local")


def test_auth_lookup_treats_user_not_found_as_available_email():
    not_found = bootstrap_admin.auth.UserNotFoundError("not found")
    with patch.object(bootstrap_admin.auth, "get_user_by_email", side_effect=not_found) as lookup:
        assert bootstrap_admin._require_auth_email_unused("1234567890@sparsh.local") is None
    lookup.assert_called_once_with("1234567890@sparsh.local")


def test_auth_lookup_classifies_sdk_errors_without_error_text():
    failure = FirebaseLikeError("private credential content")
    assert bootstrap_admin._auth_lookup_reason(failure) == "permission-or-credential-error"
    assert bootstrap_admin._auth_lookup_reason(ValueError("malformed")) == "invalid-email"


def test_existing_worker_promotion_changes_only_role():
    tx = Mock()
    profile_ref = object()
    profile = {
        "name": "SPARSH Worker",
        "role": "worker",
        "centre_ids": [],
        "created_by": "original-provisioning",
    }

    bootstrap_admin._promote_existing_profile(tx, profile_ref, profile)

    tx.update.assert_called_once_with(profile_ref, {"role": "admin"})
    assert profile == {
        "name": "SPARSH Worker",
        "role": "worker",
        "centre_ids": [],
        "created_by": "original-provisioning",
    }


def test_existing_worker_promotion_rejects_incomplete_profile_without_write():
    tx = Mock()
    with pytest.raises(RuntimeError, match="complete worker profile"):
        bootstrap_admin._promote_existing_profile(
            tx,
            object(),
            {"name": "SPARSH Worker", "role": "worker"},
        )
    tx.update.assert_not_called()

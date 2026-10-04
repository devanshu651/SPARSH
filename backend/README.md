# SPARSH backend

FastAPI service for child registration, longitudinal health measurements,
developmental screenings, referrals, and role-based access.

## Run locally

1. Create a Firebase project, enable **Firestore** and **Firebase Authentication**.
2. Download a service account JSON file and place it outside version control (for
   example `backend/service-account.json`).
3. Copy `.env.example` to `.env` and set `FIREBASE_PROJECT_ID` and
   `FIREBASE_SERVICE_ACCOUNT_PATH`.
4. Install and start the service:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Interactive API documentation is available at `http://localhost:8000/docs`.

## Authentication and roles

The frontend signs in with Firebase Authentication and passes its Firebase ID token:

```text
Authorization: Bearer <firebase-id-token>
```

Firebase Authentication establishes the caller's identity. The Firestore
document at `users/{uid}` is the authoritative application profile for `role`,
`name`, and `centre_ids`; token custom claims are intentionally not used for
authorization. Profile changes therefore apply to the next API request. Tokens
are verified with revoked-token checking, which also rejects disabled users.
Worker and supervisor documents should include `centre_ids: ["centre-id"]`;
admins are unrestricted. A worker must have at least one assigned centre to
register a child. Centre assignments are checked server-side for every child,
health, screening, and referral operation.

Firestore collections: `users`, `centres`, `children`, `children/{child_id}/health_data`,
`screenings`, and `referrals`.

## Centre administration

`/api/v1/centres` supports centre creation, listing, retrieval, and updates.
Only administrators can create or update a centre. Workers and supervisors can
only retrieve centres present in their `centre_ids`; administrators can access
all centres. Child registration verifies both that the caller is assigned to
the submitted `centre_id` and that the centre exists and is active. The stored
centre name is sourced from the centre record rather than the client payload.
Centre codes are trimmed and uppercased before storage and uniqueness checks.
Creation reserves the normalized code transactionally using `centre_codes`.

## First local administrator

There is no public admin-registration endpoint. When a project has no Admin,
an operator with access to the backend service credentials can run the
one-time, local-only CLI bootstrap. It requires explicit local-environment
confirmation, an exact Firebase project ID match, and refuses to run if an
Admin profile exists or the Firestore bootstrap marker was already reserved.
It creates a real Firebase Email/Password account and the corresponding
`users/{uid}` Admin profile. No Centre is created automatically. The marker is
kept after success, permanently closing this bootstrap for that Firebase
project. Do not run it against a production project.

In PowerShell, from the `backend` directory, set the following environment
variables with your own real values (never commit them):

```powershell
$env:SPARSH_ENVIRONMENT = 'local'
$env:SPARSH_LOCAL_ADMIN_BOOTSTRAP = 'I_CONFIRM_LOCAL_FIRST_ADMIN'
$env:SPARSH_LOCAL_ADMIN_PROJECT_ID = '<same value as FIREBASE_PROJECT_ID>'
$env:SPARSH_LOCAL_ADMIN_NAME = '<administrator name>'
$env:SPARSH_LOCAL_ADMIN_MOBILE = '<10-digit mobile number>'
$securePassword = Read-Host 'New Admin password' -AsSecureString
$env:SPARSH_LOCAL_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $securePassword).Password
python -m app.bootstrap_admin
Remove-Item Env:\SPARSH_ENVIRONMENT, Env:\SPARSH_LOCAL_ADMIN_BOOTSTRAP, Env:\SPARSH_LOCAL_ADMIN_PROJECT_ID, Env:\SPARSH_LOCAL_ADMIN_NAME, Env:\SPARSH_LOCAL_ADMIN_MOBILE, Env:\SPARSH_LOCAL_ADMIN_PASSWORD
```

To promote an existing worker Auth identity as the first Admin, set the same
local environment, confirmation, project ID, and mobile variables, then also
set `SPARSH_LOCAL_ADMIN_PROMOTE_UID` to that existing Auth user's exact UID.
The promotion path requires the Auth user to be active and to have a complete
worker profile. It changes only `users/{uid}.role` to `admin`; profile fields
such as `name` and `centre_ids`, and the Auth identity and password, are kept.
It uses the same one-time bootstrap marker and refuses to run if an Admin or
marker already exists. Do not set `SPARSH_LOCAL_ADMIN_NAME` or
`SPARSH_LOCAL_ADMIN_PASSWORD` for this mode.

The backend must have its normal `.env` Firebase project and service-account
configuration. Sign in in the app with the Admin mobile number and password;
the mobile is mapped to the same `<10-digit-mobile>@sparsh.local` Firebase
email used by worker provisioning. From the dashboard, open **Admin Console**.
In **Centres**, create an active Anganwadi Centre. In **Users**, edit the
existing Worker and select the Centre, then save. Newly provisioned workers
and supervisors must also be assigned at least one active Centre. Have the
Worker sign out and back in to refresh their profile; the worker can then
register children only for an assigned, active Centre.

## Inactive-centre policy

Current implementation blocks new child registration at inactive centres.
Existing child records remain readable to authorized users. Whether inactivity
should also block health-data writes, screening submissions, or referrals is a
product decision that has not yet been defined; those existing behaviours are
intentionally unchanged.

The frontend can use the Firebase web SDK's IndexedDB persistence for offline
reads and queued writes. This API remains the authoritative server-side path for
validated writes and scoring.

## Administrative user provisioning

Administrators manage application accounts through `/api/v1/users`. `POST
/users` provisions only worker or supervisor accounts using the existing
`<10-digit-mobile>@sparsh.local` Firebase Email/Password identity. Passwords
are passed only to Firebase Authentication and are never stored in Firestore.
The API validates that assigned centres exist and are active, then creates the
authoritative `users/{uid}` profile. If profile creation fails after Firebase
account creation, it attempts to delete the new Auth account; an unsuccessful
compensation can leave an orphaned Auth account, but it cannot access this API
without a profile.

Administrators can list, retrieve, update, and enable/disable provisioned users.
Disabling uses Firebase Authentication's `disabled` flag, so disabled accounts
are rejected during token verification. There is currently no protection against
an administrator disabling or demoting the final active administrator: the API
checks admin Firestore profiles and current Firebase disabled states and returns
409 if no other active admin exists. Firestore transactions serialize concurrent
profile operations, but Firebase Auth state cannot participate in a Firestore
transaction; direct out-of-band Firebase Admin/Console changes still require an
operational recovery procedure.

## Developmental content candidate

The active production catalog is `backend/app/config/milestones.json` (`phase5-final-65-v2`): 65 questions, 13 per domain. The backend selects only the exact supported checkpoint for the child's completed age. WHO ranges and review-required items remain in the catalog but are not selected automatically. Candidate source files and review artifacts remain available for audit. The questions and scoring have not been clinically validated; SPARSH provides screening/risk indication, not diagnosis. See `docs/active-developmental-content.md` for age evidence, scoring compatibility, limitations, and migration notes.

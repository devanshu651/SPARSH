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

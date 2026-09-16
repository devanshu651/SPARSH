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

The API accepts `worker`, `supervisor`, and `admin` from the token's custom
`role` claim. A Firestore document at `users/{uid}` is used as a fallback during
the transition to custom claims. Worker and supervisor documents should include
`centre_ids: ["centre-id"]`; admins are unrestricted.

Firestore collections: `users`, `children`, `children/{child_id}/health_data`,
`screenings`, and `referrals`.

The frontend can use the Firebase web SDK's IndexedDB persistence for offline
reads and queued writes. This API remains the authoritative server-side path for
validated writes and scoring.

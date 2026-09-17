from functools import lru_cache
import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings

@lru_cache
def get_firestore_client():
    if not firebase_admin._apps:
        options = {"projectId": settings.firebase_project_id} if settings.firebase_project_id else None
        credential = credentials.Certificate(settings.firebase_service_account_path) if settings.firebase_service_account_path else credentials.ApplicationDefault()
        firebase_admin.initialize_app(credential, options)
    return firestore.client()

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.auth import CurrentUser
router = APIRouter(prefix="/users", tags=["users"])
@router.get("/me", response_model=CurrentUser)
def me(user: CurrentUser = Depends(get_current_user)) -> CurrentUser: return user

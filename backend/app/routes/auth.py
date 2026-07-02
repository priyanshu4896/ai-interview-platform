from fastapi import APIRouter, Depends

from app.schemas.auth_schema import (
    LoginRequest,
    ProfileUpdateRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import get_user, login_user, register_user, update_user_name
from app.utils.security import get_current_user_id


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest):
    return register_user(payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    return login_user(payload)


@router.get("/me", response_model=UserResponse)
def current_user(user_id: str = Depends(get_current_user_id)):
    return get_user(user_id)


@router.patch("/me", response_model=UserResponse)
def update_profile(payload: ProfileUpdateRequest, user_id: str = Depends(get_current_user_id)):
    return update_user_name(user_id, payload.name)

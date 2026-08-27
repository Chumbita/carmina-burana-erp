from fastapi import APIRouter, HTTPException, Depends, status
from src.domain.entities.user import User
from src.presentation.dependencies.auth import get_current_user

users_router = APIRouter(prefix="/user", tags=["User"])

# CHANGE PASSWORD
from src.application.use_cases.users import ChangePasswordUseCase, UpdateProfileUseCase
from src.presentation.dependencies.use_cases.user import (
    get_change_password_use_case,
    get_update_profile_use_case,
)
from src.presentation.schemas.user_schemas import ChangePasswordRequest, UpdateProfileRequest


def _user_response(user: User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
    }

@users_router.patch("/change-password")
async def change_password(
    request: ChangePasswordRequest, 
    current_user: User = Depends(get_current_user), 
    use_case: ChangePasswordUseCase = Depends(get_change_password_use_case)
):
    """ 
    Endpoint para cambiar contraseña de usuario.
    """
    try: 
        result = await use_case.execute(
            user_id=current_user.id,
            current_password=request.current_password,
            new_password=request.new_password
        )
        return {"message": "Contraseña actualizada exitosamente."}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(e)
        )


@users_router.patch("/profile")
async def update_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    use_case: UpdateProfileUseCase = Depends(get_update_profile_use_case),
):
    try:
        user = await use_case.execute(user_id=current_user.id, email=request.email)
        return {"user": _user_response(user)}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(e),
        )

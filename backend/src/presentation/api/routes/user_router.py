from fastapi import APIRouter, HTTPException, Depends, status
from src.domain.entities.user import User
from src.domain.repositories.user_repository import IUserRepository
from src.presentation.dependencies.auth import get_current_user

users_router = APIRouter(prefix="/user", tags=["User"])

# CHANGE PASSWORD
from src.application.use_cases.users import ChangePasswordUseCase
from src.presentation.dependencies.use_cases.user import get_change_password_use_case
from src.presentation.schemas.user_schemas import ChangePasswordRequest

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
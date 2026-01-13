from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.application.use_cases.users import ChangePasswordUseCase
from src.infrastructure.database.deps import get_db
from src.domain.entities.user import User

# Dependencias del caso de uso: ChangePasswordUseCase
from src.infrastructure.database.repositories.user_repository import UserRepository
from src.infrastructure.security.password_hasher import PasswordHasher
from src.presentation.dependencies.auth import get_current_user

# Schemas
from src.presentation.schemas.user_schemas import ChangePasswordRequest

users_router = APIRouter(prefix="/users", tags=["User"])

@users_router.patch("/change-password")
async def change_password(request: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """ 
    Endpoint para cambiar contraseña de usuario.
    """
    
    # Instanciar dependencias
    repository = UserRepository(db)
    password_service = PasswordHasher()
    user_id = current_user.id
    
    # Ejecutar caso de uso 
    change_password_use_case = ChangePasswordUseCase(repository, password_service)
    
    try: 
        result = await change_password_use_case.execute(
            user_id=user_id,
            current_password=request.current_password,
            new_password=request.new_password
        )
        return {"message": "Contraseña actualizada exitosamente."}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(e)
        )
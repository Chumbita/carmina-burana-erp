from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.application.use_cases.auth.login_use_case import LoginUseCase
from src.infrastructure.database.deps import get_db

# Dependencias del caso de uso: login_use_case
from src.infrastructure.database.repositories.user_repository import UserRepository
from src.infrastructure.security.password_hasher import PasswordHasher
from src.infrastructure.security.jwt_handler import JWTHandler

# Schemas
from src.presentation.schemas.auth_schemas import LoginRequest, TokenResponse

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """ 
    Autentica un usuario y devuelve un token JWT.
    
    - Valida las credenciales.
    - Si las credenciales son válidas, genera un token.
    """
    
    # Instanciar dependencias
    repository = UserRepository(db)
    password_service = PasswordHasher()
    token_service = JWTHandler()
    
    # Ejecutar caso de uso correspondiente
    login_use_case = LoginUseCase(repository, password_service, token_service)
    
    try: 
        result = await login_use_case.execute(
            username=request.username,
            password=request.password
        )
        
        return TokenResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )
    
from fastapi import APIRouter, HTTPException, Depends, status

auth_router = APIRouter(prefix="/auth", tags=["auth"])

# LOGIN
from src.application.use_cases.auth.login_use_case import LoginUseCase
from src.presentation.dependencies.use_cases.auth import get_login_use_case
from src.presentation.schemas.auth_schemas import LoginRequest, TokenResponse

@auth_router.post("/login", response_model=TokenResponse)
async def login (
    request: LoginRequest, 
    login_use_case: LoginUseCase = Depends(get_login_use_case),
):
    
    """ 
    Autentica un usuario y devuelve un token JWT.
    
    - Valida las credenciales.
    - Si las credenciales son válidas, genera un token.
    """
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
    
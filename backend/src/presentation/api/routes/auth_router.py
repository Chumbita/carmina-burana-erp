from fastapi import APIRouter, HTTPException, Depends, status, Response, Request
from fastapi.responses import JSONResponse

from src.infrastructure.config.settings import settings

auth_router = APIRouter(prefix="/auth", tags=["auth"])


# =====================
# IMPORTS
# =====================
from src.application.use_cases.auth.login_use_case import LoginUseCase
from src.application.use_cases.auth.refresh_token_use_case import RefreshTokenUseCase
from src.application.use_cases.auth.logout_use_case import LogoutUseCase
from src.presentation.dependencies.use_cases.auth import (
    get_login_use_case,
    get_refresh_token_use_case,
    get_logout_use_case
)
from src.presentation.schemas.auth_schemas import (
    LoginRequest,
    LoginResponse,
    RefreshTokenResponse,
    LogoutResponse
)
from src.domain.entities.user import User


def _get_current_user_lazy():
    """
    Función lazy para obtener get_current_user.
    Evita importaciones circulares entre auth.py y auth_router.py.
    """
    from src.presentation.dependencies.auth import get_current_user
    return get_current_user


def _set_auth_cookies(response: JSONResponse, access_token: str, refresh_token: str) -> None:
    """
    Configura las cookies de autenticación en la respuesta.

    Cookies configuradas:
    - access_token: HttpOnly, Secure (en producción), SameSite, 15 minutos
    - refresh_token: HttpOnly, Secure (en producción), SameSite, 7 días
    """
    # Cookie de access token
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.cookie_max_age_access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
    )

    # Cookie de refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=settings.cookie_max_age_refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
    )


# =====================
# LOGIN
# =====================
@auth_router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    login_use_case: LoginUseCase = Depends(get_login_use_case),
):
    """
    Autentica un usuario y devuelve tokens de acceso.

    Flujo:
    1. Valida las credenciales
    2. Genera access token (15 minutos)
    3. Genera refresh token (7 días)
    4. Almacena refresh token en DB
    5. Configura cookies HttpOnly con ambos tokens
    6. Retorna datos del usuario (NO los tokens en el body)

    Las cookies se envían automáticamente al navegador:
    - access_token: HttpOnly (inaccesible por JavaScript), 15 minutos
    - refresh_token: HttpOnly (inaccesible por JavaScript), 7 días
    """
    try:
        result = await login_use_case.execute(
            username=request.username,
            password=request.password
        )

        # Crear respuesta con datos del usuario
        response_data = LoginResponse(**result)
        response = JSONResponse(content=response_data.model_dump())

        # Configurar cookies HttpOnly
        _set_auth_cookies(response, result["access_token"], result["refresh_token"])

        return response
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )


# =====================
# REFRESH TOKEN
# =====================
@auth_router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(
    request: Request,
    refresh_token_use_case: RefreshTokenUseCase = Depends(get_refresh_token_use_case),
):
    """
    Renueva los tokens de acceso usando el refresh token.

    Implementa Refresh Token Rotation:
    1. Valida el refresh token actual
    2. Lo revoca
    3. Genera nuevos tokens
    4. Configura nuevas cookies
    5. Retorna datos del usuario

    El refresh token se obtiene de la cookie HttpOnly automáticamente.
    """
    try:
        # Obtener el refresh token de la cookie
        refresh_token = request.cookies.get("refresh_token")

        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token no proporcionado."
            )

        result = await refresh_token_use_case.execute(refresh_token)

        # Crear respuesta con nuevos datos
        response_data = RefreshTokenResponse(**result)
        response = JSONResponse(content=response_data.model_dump())

        # Configurar nuevas cookies
        _set_auth_cookies(response, result["access_token"], result["refresh_token"])

        return response
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )


# =====================
# GET CURRENT USER
# =====================
@auth_router.get("/me")
async def get_me(
    current_user: User = Depends(_get_current_user_lazy()),
):
    """
    Retorna los datos del usuario actual.

    Utilizado por el frontend para verificar si hay una sesión válida
    al cargar la aplicación (hidratación inicial).
    """
    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "full_name": current_user.full_name,
            "role": current_user.role,
        }
    }


# =====================
# LOGOUT
# =====================
@auth_router.post("/logout", response_model=LogoutResponse)
async def logout(
    request: Request,
    response: Response,
    logout_use_case: LogoutUseCase = Depends(get_logout_use_case),
    current_user: User = Depends(_get_current_user_lazy()),
):
    """
    Cierra la sesión del usuario.

    Flujo:
    1. Obtiene el usuario actual del token
    2. Revoca todos sus refresh tokens
    3. Elimina las cookies de autenticación

    Esto cierra efectivamente todas las sesiones del usuario.
    """
    try:
        # Revocar todos los refresh tokens del usuario
        await logout_use_case.execute(current_user.id)

        # Crear respuesta con cookies eliminadas
        response = JSONResponse(
            content={"message": "Sesión cerrada exitosamente."}
        )

        # Eliminar cookies
        response.delete_cookie(
            key="access_token",
            path="/",
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE
        )
        response.delete_cookie(
            key="refresh_token",
            path="/",
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE
        )

        return response
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al cerrar sesión."
        )

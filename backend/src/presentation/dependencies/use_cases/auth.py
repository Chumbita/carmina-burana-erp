from fastapi import Depends

# =========================
# REPOSITORIES
# =========================
from src.domain.repositories.user_repository import IUserRepository
from src.domain.repositories.refresh_token_repository import IRefreshTokenRepository
from src.presentation.dependencies.repositories import get_user_repository
from src.presentation.dependencies.repositories import get_refresh_token_repository

# =========================
# SERVICES
# =========================
from src.domain.services.password_service import IPasswordService
from src.domain.services.token_service import ITokenService
from src.presentation.dependencies.services import get_password_hasher_service
from src.presentation.dependencies.services import get_token_handler_service

# =========================
# USE CASES
# =========================
from src.application.use_cases.auth.login_use_case import LoginUseCase
from src.application.use_cases.auth.refresh_token_use_case import RefreshTokenUseCase
from src.application.use_cases.auth.logout_use_case import LogoutUseCase


def get_login_use_case(
    repository: IUserRepository = Depends(get_user_repository),
    password_hasher: IPasswordService = Depends(get_password_hasher_service),
    token_handler: ITokenService = Depends(get_token_handler_service),
    refresh_token_repository: IRefreshTokenRepository = Depends(get_refresh_token_repository),
) -> LoginUseCase:
    """
    Factory para LoginUseCase.
    
    Inyecta todas las dependencias necesarias:
    - User repository para buscar usuarios
    - Password service para verificar credenciales
    - Token service para generar tokens
    - Refresh token repository para persistir refresh tokens
    """
    return LoginUseCase(repository, password_hasher, token_handler, refresh_token_repository)


def get_refresh_token_use_case(
    refresh_token_repository: IRefreshTokenRepository = Depends(get_refresh_token_repository),
    user_repository: IUserRepository = Depends(get_user_repository),
    token_handler: ITokenService = Depends(get_token_handler_service),
) -> RefreshTokenUseCase:
    """
    Factory para RefreshTokenUseCase.
    
    Implementa Refresh Token Rotation:
    - Valida el refresh token actual
    - Lo revoca
    - Genera nuevos tokens
    """
    return RefreshTokenUseCase(refresh_token_repository, user_repository, token_handler)


def get_logout_use_case(
    refresh_token_repository: IRefreshTokenRepository = Depends(get_refresh_token_repository),
) -> LogoutUseCase:
    """
    Factory para LogoutUseCase.
    
    Invalida todos los refresh tokens del usuario.
    """
    return LogoutUseCase(refresh_token_repository)

from fastapi import Depends

# =========================
# LOGIN USE CASE 
# =========================
from src.application.use_cases.auth.login_use_case import LoginUseCase
from src.domain.services.password_service import IPasswordService
from src.domain.services.token_service import ITokenService
from src.domain.repositories.user_repository import IUserRepository
from src.presentation.dependencies.repositories import get_user_repository
from src.presentation.dependencies.services import get_password_hasher_service
from src.presentation.dependencies.services import get_token_handler_service

def get_login_use_case(
    repository: IUserRepository = Depends(get_user_repository),
    password_hasher: IPasswordService = Depends(get_password_hasher_service),
    token_handler: ITokenService = Depends(get_token_handler_service),
) -> LoginUseCase:
    return LoginUseCase(repository, password_hasher, token_handler)

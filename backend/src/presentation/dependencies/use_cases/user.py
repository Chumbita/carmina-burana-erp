# USER USE CASE FACTORY
from fastapi import Depends
from src.domain.repositories.user_repository import IUserRepository
from src.presentation.dependencies.repositories import get_user_repository
from src.domain.services.password_service import IPasswordService

# ===========================
# CHANGE PASSWORD USE CASE 
# ===========================
from src.application.use_cases.users.change_password_use_case import ChangePasswordUseCase
from src.presentation.dependencies.services import get_password_hasher_service

def get_change_password_use_case(
    repository: IUserRepository = Depends(get_user_repository),
    password_hasher: IPasswordService = Depends(get_password_hasher_service)
) -> ChangePasswordUseCase:
    return ChangePasswordUseCase(repository, password_hasher)
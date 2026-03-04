# REPOSITORY FACTORY
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.database.deps import get_db

# ======================
# USER REPOSITORY
# ======================
from src.infrastructure.database.repositories.user_repository import UserRepository
from src.domain.repositories.user_repository import IUserRepository

def get_user_repository(
    db: AsyncSession = Depends(get_db),
) -> IUserRepository:
    return UserRepository(db)

# ======================
# INPUT REPOSITORY
# ======================
from src.infrastructure.database.repositories.input_repository_impl import InputRepositoryImpl
from src.domain.repositories.input_repository import InputRepository

def get_input_repository(
    db: AsyncSession = Depends(get_db),
) -> InputRepository:
    return InputRepositoryImpl(db)
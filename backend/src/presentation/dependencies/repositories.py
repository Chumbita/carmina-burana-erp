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

# ======================
# PRODUCT REPOSITORY
# ======================
from src.infrastructure.database.repositories.product_repository import ProductRepository
from src.domain.repositories.product_repository import IProductRepository

def get_product_repository(
    db: AsyncSession= Depends(get_db),
) -> IProductRepository:
    return ProductRepository(db)

# ======================
# BOM REPOSITORY
# ======================
from src.infrastructure.database.repositories.bom_repository import BomRepository
from src.domain.repositories.bom_repository import IBomRepository

def get_bom_repository(
    db: AsyncSession= Depends(get_db),
) -> IBomRepository:
    return BomRepository(db)
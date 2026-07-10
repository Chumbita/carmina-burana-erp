# REPOSITORY FACTORY
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.database.deps import get_db

# ══════════════════════════════
# USER REPOSITORY
# ══════════════════════════════
from src.infrastructure.database.repositories.user_repository import UserRepository
from src.domain.repositories.user_repository import IUserRepository

def get_user_repository(
    db: AsyncSession = Depends(get_db),
) -> IUserRepository:
    return UserRepository(db)

# ══════════════════════════════
# INPUT REPOSITORY
# ══════════════════════════════
from src.infrastructure.database.repositories.input_repository_impl import InputRepositoryImpl
from src.domain.repositories.input_repository import InputRepository

def get_input_repository(
    db: AsyncSession = Depends(get_db),
) -> InputRepository:
    return InputRepositoryImpl(db)

# ══════════════════════════════
# UOM REPOSITORY
# ══════════════════════════════
from src.infrastructure.database.repositories.uom_repository import UomRepository
from src.domain.repositories.uom_repository import IUomRepository

def get_uom_respository(
    db: AsyncSession = Depends(get_db),
) -> IUomRepository:
    return UomRepository(db)

# ══════════════════════════════
# BRAND REPOSITORY
# ══════════════════════════════
from src.infrastructure.database.repositories.brand_repository import BrandRepository
from src.domain.repositories.brand_repository import IBrandRepository

def get_brand_respository(
    db: AsyncSession = Depends(get_db),
) -> IBrandRepository:
    return BrandRepository(db)

# ══════════════════════
# ITEM REPOSITORY
# ══════════════════════
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.domain.repositories.item_repository import IItemRepostory

def get_item_repository(
    db: AsyncSession = Depends(get_db),
) -> IItemRepostory:
    return ItemRepository(db)

# ══════════════════════════════
# REFRESH TOKEN REPOSITORY
# ══════════════════════════════
from src.infrastructure.database.repositories.refresh_token_repository import RefreshTokenRepository
from src.domain.repositories.refresh_token_repository import IRefreshTokenRepository

def get_refresh_token_repository(
    db: AsyncSession = Depends(get_db),
) -> IRefreshTokenRepository:
    return RefreshTokenRepository(db)

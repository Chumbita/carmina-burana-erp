from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.infrastructure.database.repositories.packaging_supply_repository import PackagingSupplyRepository
from src.infrastructure.database.models.item_type_model import ItemTypeModel

from src.application.use_cases.packaging_supply.create_packaging_supply import PackagingSupplyItemCreator
from src.application.use_cases.item.create_specialized_item import CreateItemUseCase


def get_create_packaging_supply_use_case(
    session: AsyncSession = Depends(get_db),
) -> CreateItemUseCase:
    item_repository = ItemRepository(session)
    ps_repository = PackagingSupplyRepository(session)
    ps_creator = PackagingSupplyItemCreator(ps_repository)
    return CreateItemUseCase(item_repository, ps_creator)


def get_packaging_supply_repository(
    session: AsyncSession = Depends(get_db),
) -> PackagingSupplyRepository:
    return PackagingSupplyRepository(session)


async def get_packaging_supply_item_type_id(
    session: AsyncSession = Depends(get_db),
) -> int:
    result = await session.execute(
        select(ItemTypeModel.id).where(ItemTypeModel.code == "packaging_supply")
    )
    item_type_id = result.scalar_one_or_none()
    if item_type_id is None:
        raise ValueError("Item type 'packaging_supply' not found. Run seed first.")
    return item_type_id
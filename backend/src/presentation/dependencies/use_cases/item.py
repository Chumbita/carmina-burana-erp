from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.application.use_cases.item.production_order.get_item_manufacturable import GetManufacturableItemsUseCase

def get_manufacturable_items_use_case(
    session: AsyncSession = Depends(get_db),
) -> GetManufacturableItemsUseCase:
    item_repository = ItemRepository(session)
    return GetManufacturableItemsUseCase(item_repository)
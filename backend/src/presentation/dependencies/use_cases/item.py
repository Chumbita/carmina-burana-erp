# ══════════════════════════════════════════════════════════════════════════════
# ITEM USE CASE FACTORY
# ══════════════════════════════════════════════════════════════════════════════

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.application.use_cases.item.list_item_options_use_case import ListItemOptionsUseCase
from src.presentation.dependencies.repositories import get_item_repository
from src.domain.repositories.item_repository import IItemRepostory
from src.application.use_cases.item.production_order.get_item_manufacturable import GetManufacturableItemsUseCase


def get_list_item_options_use_case(
    repository: IItemRepostory = Depends(get_item_repository)
) -> ListItemOptionsUseCase:
    return ListItemOptionsUseCase(repository)


def get_manufacturable_items_use_case(
    session: AsyncSession = Depends(get_db),
) -> GetManufacturableItemsUseCase:
    item_repository = ItemRepository(session)
    return GetManufacturableItemsUseCase(item_repository)

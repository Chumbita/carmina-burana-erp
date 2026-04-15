from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.supply_repository import SupplyRepository
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.application.use_cases.supply.create_supply import SupplyItemCreator
from src.application.use_cases.item.create_item_use_case import CreateItemUseCase


def get_create_supply_use_case(
    session: AsyncSession = Depends(get_db),
) -> CreateItemUseCase:
    """
    Fábrica que instancia CreateItemUseCase con el creator específico de supply.
    """
    item_repository = ItemRepository(session)
    supply_repository = SupplyRepository(session)
    supply_creator = SupplyItemCreator(supply_repository)
    return CreateItemUseCase(item_repository, supply_creator)


def get_supply_repository(
    session: AsyncSession = Depends(get_db),
) -> SupplyRepository:
    """Inyecta el repositorio de supply para obtener datos adicionales."""
    return SupplyRepository(session)
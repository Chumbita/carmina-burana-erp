from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.supply_repository import SupplyRepository
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.application.use_cases.supply.create_supply import SupplyItemCreator
from src.application.use_cases.item.create_item_use_case import CreateItemUseCase
from src.application.use_cases.supply.list_supplies_use_case import ListSuppliesUseCase
from src.application.use_cases.supply.get_supply_use_case import GetSupplyUseCase
from src.application.use_cases.supply.update_supply_use_case import UpdateSupplyUseCase
from src.application.use_cases.supply.delete_supply_use_case import DeleteSupplyUseCase


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


def get_list_supplies_use_case(
    session: AsyncSession = Depends(get_db),
) -> ListSuppliesUseCase:
    """Fábrica para el caso de uso de listado de supplies."""
    item_repository = ItemRepository(session)
    supply_repository = SupplyRepository(session)
    return ListSuppliesUseCase(item_repository, supply_repository)


def get_get_supply_use_case(
    session: AsyncSession = Depends(get_db),
) -> GetSupplyUseCase:
    """Fábrica para el caso de uso de obtener supply por ID."""
    item_repository = ItemRepository(session)
    supply_repository = SupplyRepository(session)
    return GetSupplyUseCase(item_repository, supply_repository)


def get_update_supply_use_case(
    session: AsyncSession = Depends(get_db),
) -> UpdateSupplyUseCase:
    """Fábrica para el caso de uso de actualización de supply."""
    item_repository = ItemRepository(session)
    supply_repository = SupplyRepository(session)
    return UpdateSupplyUseCase(item_repository, supply_repository)


def get_delete_supply_use_case(
    session: AsyncSession = Depends(get_db),
) -> DeleteSupplyUseCase:
    """Fábrica para el caso de uso de eliminación de supply."""
    item_repository = ItemRepository(session)
    return DeleteSupplyUseCase(item_repository)
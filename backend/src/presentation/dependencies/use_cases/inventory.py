from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.inventory_lot_repository import InventoryLotRepository
from src.application.use_cases.inventory.get_lots_by_item import GetLotsByItemUseCase


def build_get_lots_by_item(
    session: AsyncSession = Depends(get_db),
) -> GetLotsByItemUseCase:
    lot_repo = InventoryLotRepository(session)
    return GetLotsByItemUseCase(lot_repo=lot_repo)

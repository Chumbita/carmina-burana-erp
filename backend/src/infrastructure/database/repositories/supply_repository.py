from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.domain.entities.supply import Supply
from src.domain.repositories.supply_repository import ISupplyRepository
from src.infrastructure.database.models.supply_model import SupplyModel


class SupplyRepository(ISupplyRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, supply: Supply) -> None:
        model = SupplyModel(
            item_id=supply.item_id,
            supply_category=supply.supply_category.value,
            created_at=supply.created_at,
            updated_at=supply.updated_at,
        )
        self._session.add(model)
        await self._session.flush()

    async def get_by_item_id(self, item_id: int) -> Optional[Supply]:
        result = await self._session.execute(
            select(SupplyModel).where(SupplyModel.item_id == item_id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return Supply(
            item_id=model.item_id,
            supply_category=model.supply_category,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
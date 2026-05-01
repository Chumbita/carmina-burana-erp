# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE INSUMOS
# ══════════════════════════════════════════════════════════════════════════════


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

    # ── Utilidades ────────────────────────────────────────────────
    @staticmethod
    def _to_entity(model: SupplyModel) -> Supply:
        """ 
        Convertor 'Modelo' -> 'Entidad'.
        """
        return Supply(
            item_id=model.item_id,
            supply_category=model.supply_category,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
    @staticmethod
    def _to_model(entity: Supply) -> SupplyModel:
        """ 
        Convertor 'Entidad' -> 'Modelo'.
        """
        return SupplyModel(
            item_id=entity.item_id,
            supply_category=entity.supply_category.value,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
    
    # ── Commands ────────────────────────────────────────────────
    
    async def add(self, supply: Supply) -> None:
        """ 
        Inserta un nuevo insumo en la base de datos y devuelve la entidad 
        con su ID asignado. Lo agrega a la sesión y hace flush() (sin commit).
        """
        model = self._to_model(supply)
        self._session.add(model)
        await self._session.flush()

    
    # ── Queries ────────────────────────────────────────────────
    
    async def get_by_item_id(self, item_id: int) -> Optional[Supply]:
        """ 
        Busca un 'supply' por ID y lo devuelve como entidad de dominio.
        """
        stmt = select(SupplyModel).where(SupplyModel.item_id == item_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        
        return self._to_entity(model) if model else None
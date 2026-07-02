# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE BRAND
# ══════════════════════════════════════════════════════════════════════════════

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete as sa_delete

from src.domain.entities.brand import Brand
from src.domain.repositories.brand_repository import IBrandRepository
from src.infrastructure.database.models.brand_model import BrandModel


class BrandRepository(IBrandRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session


    # ── Utilidades ────────────────────────────────────────────────

    @staticmethod
    def _to_entity(model: BrandModel) -> Brand:
        """
        Convertor 'Modelo' -> 'Entidad'.
        """
        return Brand(
            id=model.id,
            name=model.name,
            created_at=model.created_at
        )

    @staticmethod
    def _to_model(entity: Brand) -> BrandModel:
        """
        Convertor 'Entidad' -> 'Modelo'.
        """
        return BrandModel(
            id=entity.id,
            name=entity.name,
            created_at=entity.created_at
        )


    # ── Queries ─────────────────────────────────────────────────────

    async def get_all(self) -> List[Brand]:
        """
        Obtiene un listado de todas las marcas registradas.
        """

        stmt = select(BrandModel)
        result = await self._session.execute(stmt)
        rows = result.scalars().all()

        return [self._to_entity(row) for row in rows]

    async def delete(self, brand_id: int) -> bool:
        stmt = sa_delete(BrandModel).where(BrandModel.id == brand_id)
        result = await self._session.execute(stmt)
        await self._session.flush()
        return result.rowcount > 0

# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE UOM
# ══════════════════════════════════════════════════════════════════════════════

from typing import Optional
from sqlalchemy.ext.asyncio import async_session
from sqlalchemy import select

from src.domain.entities.uom import Uom
from src.domain.repositories.uom_repository import IUomRepository
from src.infrastructure.database.models.uom_model import UomModel

class UomRespository(IUomRepository):

    def __int__(self, session: async_session) -> None:
        self._session = session

    # ── Utilidades ────────────────────────────────────────────────

    @staticmethod
    def _to_entity(model: UomModel) -> Uom:
        """
        Convertor 'Modelo' -> 'Entidad'.
        """
        return Uom(
            id=model.id,
            name=model.name,
            symbol=model.symbol,
            uom_type=model.uom_type,
            factor_to_base=float(model.factor_to_base) if model.factor_to_base is not None else None,
            is_base=model.is_base,
        )
    
    async def get_by_id(self, uom_id: int) -> Optional[Uom]:
        """
        Busca una unidad de medida por ID y la devuelve como entidad de dominio.
        Retorna None si no existe.
        """
        stmt = select(UomModel).where(UomModel.id == uom_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

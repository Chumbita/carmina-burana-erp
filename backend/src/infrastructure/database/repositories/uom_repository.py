# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE UOM
# ══════════════════════════════════════════════════════════════════════════════

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.domain.entities.uom import Uom
from src.domain.repositories.uom_repository import IUomRepository
from src.domain.value_objects.uom_type import UomType
from src.infrastructure.database.models.uom_model import UomModel
from src.application.dtos.uom.uom_responses_dtos import UomOptionResponseDTO as UomOption

class UomRepository(IUomRepository):

    def __init__(self, session: AsyncSession) -> None:
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
            uom_type=UomType(model.uom_type),
            factor_to_base=float(model.factor_to_base) if model.factor_to_base is not None else None,
            is_base=model.is_base,
        )

    # ── Queries ────────────────────────────────────────────────

    async def get_by_id(self, uom_id: int) -> Optional[Uom]:
        """
        Busca una unidad de medida por ID y la devuelve como entidad de dominio.
        Retorna None si no existe.
        """
        stmt = select(UomModel).where(UomModel.id == uom_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_entity(model) if model else None


    async def get_symbol_by_id(self, uom_id: int) -> Optional[str]:
        stmt = select(UomModel.symbol).where(UomModel.id == uom_id)
        result = await self._session.execute(stmt)
        row = result.scalar_one_or_none()
        return row

    async def list_options(self) -> List[UomOption]:
        """
        Obtiene todas las unidades de medidas para poblar de información
        a elementos del front-end.
        """
        stmt = select(
            UomModel.id,
            UomModel.name,
            UomModel.symbol
        )
        result = await self._session.execute(stmt)
        rows = result.all()

        return [UomOption(id = row.id, name=row.name, symbol=row.symbol) for row in rows]

    async def get_symbol_by_id(self, uom_id: int) -> Optional[str]:
        stmt = select(UomModel.symbol).where(UomModel.id == uom_id)
        result = await self._session.execute(stmt)
        row = result.scalar_one_or_none()
        return row

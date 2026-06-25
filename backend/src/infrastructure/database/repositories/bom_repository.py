from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities.bom import Bom, BomLine
from src.domain.repositories.bom_repository import IBomRepository
from src.infrastructure.database.models.bom_model import BomModel
from src.infrastructure.database.models.bom_line_model import BomLineModel


class BomRepository(IBomRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Mappers ──────────────────────────────────────────────────

    @staticmethod
    def _to_entity(model: BomModel) -> Bom:
        bom = Bom(
            id=model.id,
            parent_item_id=model.parent_item_id,
            version=model.version,
            is_active=model.is_active,
            valid_from=model.valid_from,
            valid_to=model.valid_to,
            created_at=model.created_at,
        )

        bom.lines = [
            BomLine(
                id=line.id,
                bom_id=line.bom_id,
                component_item_id=line.component_item_id,
                quantity=line.quantity,
                uom=line.uom,
                scrap_factor=line.scrap_factor,
                created_at=line.created_at,
            )
            for line in model.lines
        ]

        return bom

    @staticmethod
    def _to_model(bom: Bom) -> BomModel:
        model = BomModel(
            parent_item_id=bom.parent_item_id,
            version=bom.version,
            is_active=bom.is_active,
            valid_from=bom.valid_from,
            valid_to=bom.valid_to,
            created_at=bom.created_at,
        )

        if bom.id is not None:
            model.id = bom.id

        model.lines = [
            BomLineModel(
                bom_id=bom.id,
                component_item_id=line.component_item_id,
                quantity=line.quantity,
                uom=line.uom,
                scrap_factor=line.scrap_factor,
                created_at=line.created_at,
            )
            for line in bom.lines
        ]

        return model

    # ── Queries ──────────────────────────────────────────────────

    async def get_by_id(self, bom_id: int) -> Optional[Bom]:
        """
        Obtiene un BOM por su ID.
        """

        stmt = (
            select(BomModel)
            .where(BomModel.id == bom_id)
            .options(selectinload(BomModel.lines))
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

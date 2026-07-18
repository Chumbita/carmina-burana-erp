from typing import Optional, Sequence

from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities.bom import Bom, BomLine
from src.domain.repositories.bom_repository import IBomRepository
from src.infrastructure.database.models.bom_model import BomModel
from src.infrastructure.database.models.bom_line_model import BomLineModel
from src.infrastructure.database.models.item_model import ItemModel
from src.infrastructure.database.models.uom_model import UomModel


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
            quantity=model.quantity,
            uom_id=model.uom_id,
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
            quantity=bom.quantity,
            uom_id=bom.uom_id,
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

    async def get_bom_by_item(self, item_id: int) -> Optional[dict]:
        """
        Obtiene la BOM activa de un item, con sus líneas, nombre de componente
        y unidad de medida resueltos. Devuelve None si no hay BOM activa.
        """
        stmt = (
            select(BomModel)
            .where(BomModel.parent_item_id == item_id, BomModel.is_active.is_(True))
            .options(
                selectinload(BomModel.lines).selectinload(BomLineModel.component_item),
                selectinload(BomModel.lines).selectinload(BomLineModel.uom_ref),
            )
        )
        result = await self._session.execute(stmt)
        bom_model = result.scalar_one_or_none()

        if not bom_model:
            return None

        uom_symbol = None
        if bom_model.uom_id is not None:
            uom_stmt = select(UomModel.symbol).where(UomModel.id == bom_model.uom_id)
            uom_symbol = (await self._session.execute(uom_stmt)).scalar_one_or_none()

        return {
            "id": bom_model.id,
            "version": bom_model.version,
            "quantity": bom_model.quantity,
            "uom": uom_symbol,
            "lines": [
                {
                    "name": line.component_item.name if line.component_item else None,
                    "quantity": line.quantity,
                    "uom": line.uom_ref.symbol if line.uom_ref else None,
                }
                for line in bom_model.lines
            ],
        }
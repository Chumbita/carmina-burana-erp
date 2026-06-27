from typing import Optional, Sequence

from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities.bom import Bom, BomLine
from src.domain.repositories.bom_repository import IBomRepository
from src.infrastructure.database.models.bom_model import BomModel
from src.infrastructure.database.models.bom_line_model import BomLineModel
from src.infrastructure.database.models.item_model import ItemModel


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


    # ── Commands ──────────────────────────────────────────────

    async def add(self, bom: Bom) -> None:
        """
        Persiste un nuevo BOM con sus líneas en una única transacción.
        Después del flush, copia los IDs generados de vuelta a las entidades de dominio.
        """
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
        model.lines = [
            BomLineModel(
                component_item_id=line.component_item_id,
                quantity=line.quantity,
                uom=line.uom,
                created_at=line.created_at,
            )
            for line in bom.lines
        ]
        self._session.add(model)
        await self._session.flush()

        bom.id = model.id
        for i, line_model in enumerate(model.lines):
            bom.lines[i].id = line_model.id
            bom.lines[i].bom_id = model.id

    async def save(self, bom: Bom) -> None:
        """
        Persiste los cambios de un BOM existente (closing version).
        Actualiza is_active y valid_to del BOM anterior.
        """
        stmt = select(BomModel).where(BomModel.id == bom.id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if model is None:
            from src.domain.exceptions.bom_exceptions import BomNotFoundException
            raise BomNotFoundException(bom.id)

        model.is_active = bom.is_active
        model.valid_to = bom.valid_to
        await self._session.flush()


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


    async def get_by_parent_item_id(self, parent_item_id: int) -> Optional[Bom]:
        """
        Obtiene un BOM por el ID del ítem padre.
        """
        stmt = (
            select(BomModel)
            .where(BomModel.parent_item_id == parent_item_id)
            .options(selectinload(BomModel.lines))
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_entity(model) if model else None


    async def get_active_by_parent_item_id(self, parent_item_id: int) -> Optional[Bom]:
        """
        Obtiene el BOM activo para un ítem padre.
        Retorna None si no existe ningún BOM activo.
        """
        stmt = (
            select(BomModel)
            .where(BomModel.parent_item_id == parent_item_id, BomModel.is_active == True)
            .options(selectinload(BomModel.lines))
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_entity(model) if model else None


    async def get_active_boms(self) -> Sequence[dict]:
        """
        Obtiene un listado de todos los BOMs activos.
        """
        line_count_sub = (
            select(
                BomLineModel.bom_id,
                func.count(BomLineModel.id).label("components_count"),
            )
            .group_by(BomLineModel.bom_id)
            .subquery()
        )

        stmt = (
            select(
                BomModel.id,
                BomModel.parent_item_id,
                ItemModel.name.label("parent_item_name"),
                BomModel.version,
                func.coalesce(line_count_sub.c.components_count, 0).label("components_count"),
                BomModel.valid_from,
            )
            .join(ItemModel, BomModel.parent_item_id == ItemModel.id)
            .outerjoin(line_count_sub, BomModel.id == line_count_sub.c.bom_id)
            .where(BomModel.is_active == True)
            .order_by(BomModel.valid_from.desc())
        )

        result = await self._session.execute(stmt)
        rows = result.all()

        return [
            {
                "id": row.id,
                "parent_item_id": row.parent_item_id,
                "parent_item_name": row.parent_item_name,
                "version": row.version,
                "components_count": row.components_count,
                "valid_from": row.valid_from,
            }
            for row in rows
        ]

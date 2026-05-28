# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE BOM
# ══════════════════════════════════════════════════════════════════════════════

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities.bom import Bom, BomLine
from src.infrastructure.database.models.bom_model import BomModel, BomLineModel
from src.domain.repositories.bom_repository import IBomRepository

class BomRepository(IBomRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        
    # ── Utilidades ────────────────────────────────────────────────

    @staticmethod
    def _line_to_entity(model: BomLineModel) -> BomLine:
        return BomLine(
            id=model.id,
            component_item_id=model.component_item_id,
            quantity=float(model.quantity),
            scrap_factor=float(model.scrap_factor),
        )

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
            lines = [BomRepository._line_to_entity(line) for line in model.lines],
        )
        return bom

    def _load_options(self):
        return selectinload(BomModel.lines)

    # ── Queries ────────────────────────────────────────────────

    async def get_by_id(self, bom_id: int) -> Optional[Bom]:
        """
        Obtiene una BOM por su ID incluyendo sus líneas.
        """
        stmt = select(BomModel).where(BomModel.id == bom_id).options(self._load_options())
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_active_by_item(self, parent_item_id: int) -> Optional[Bom]:
        """
        Obtiene la BOM activa de un item.
        """
        stmt = (
            select(BomModel)
            .where(BomModel.parent_item_id == parent_item_id, BomModel.is_active.is_(True))
            .options(self._load_options())
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_all_active(self) -> list[Bom]:
        """
        Obtiene todas las BOMs activas con sus líneas.
        """
        stmt = (
            select(BomModel)
            .where(BomModel.is_active.is_(True))
            .options(self._load_options())
        )
        result = await self._session.execute(stmt)
        models = result.scalars().all()

        return [self._to_entity(model) for model in models]

    # ── Commands ────────────────────────────────────────────────

    async def add(self, bom: Bom) -> Bom:
        """
        Persiste una nueva BOM con sus líneas.
        """
        model = BomModel(
            parent_item_id=bom.parent_item_id,
            version=bom.version,
            is_active=bom.is_active,
            valid_from=bom.valid_from,
            valid_to=bom.valid_to,
        )
        model.lines = [
            BomLineModel(
                component_item_id=line.component_item_id,
                quantity=line.quantity,
                scrap_factor=line.scrap_factor,
            )
            for line in bom.lines
        ]

        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model, ["lines"])

        bom.id = model.id
        bom.created_at = model.created_at
        for entity_line, model_line in zip(bom.lines, model.lines):
            entity_line.id = model_line.id
        return bom

    async def deactivate_current(self, parent_item_id: int) -> None:
        """
        Desactiva la BOM activa actual de un item.
        """
        bom = await self.get_active_by_item(parent_item_id)
        if bom is None:
            return

        bom.deactivate()          # lógica de dominio, lanza si ya estaba inactiva
        await self.update(bom)   

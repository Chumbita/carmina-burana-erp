# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE PACKAGING SUPPLY
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select

from src.domain.entities.packaging_supply import PackagingSupply
from src.domain.repositories.packaging_supply_repository import (
    IPackagingSupplyRepository,
    PackagingSupplyDetailData,
)
from src.infrastructure.database.models.packaging_supply_model import PackagingSupplyModel
from src.infrastructure.database.models.item_model import ItemModel
from src.infrastructure.database.models.brand_model import BrandModel
from src.infrastructure.database.models.inventory_balance_model import InventoryBalanceModel
from src.infrastructure.database.models.uom_model import UomModel

from src.domain.exceptions.packaging_supply_exceptions import PackagingSupplyNotFoundException

class PackagingSupplyRepository(IPackagingSupplyRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Utilidades ────────────────────────────────────────────────
    @staticmethod
    def _to_entity(model: PackagingSupplyModel) -> PackagingSupply:
        return PackagingSupply(
            item_id=model.item_id,
            packaging_type=model.packaging_type,
            material=model.material,
            capacity_ml=model.capacity_ml,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _to_model(entity: PackagingSupply) -> PackagingSupplyModel:
        return PackagingSupplyModel(
            item_id=entity.item_id,
            packaging_type=entity.packaging_type.value,
            material=entity.material,
            capacity_ml=entity.capacity_ml,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    # ── Commands ────────────────────────────────────────────────

    async def add(self, packaging_supply: PackagingSupply) -> None:
        model = self._to_model(packaging_supply)
        self._session.add(model)
        await self._session.flush()

    async def save(self, packaging_supply: PackagingSupply) -> None:
        result = await self._session.execute(
            select(PackagingSupplyModel).where(PackagingSupplyModel.item_id == packaging_supply.item_id)
        )
        model = result.scalar_one_or_none()

        if model is None:
            raise PackagingSupplyNotFoundException(packaging_supply.item_id)

        model.packaging_type = packaging_supply.packaging_type.value
        model.material = packaging_supply.material
        model.capacity_ml = packaging_supply.capacity_ml
        model.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)

        await self._session.flush()

    # ── Queries ────────────────────────────────────────────────

    async def get_by_item_id(self, item_id: int) -> Optional[PackagingSupply]:
        stmt = select(PackagingSupplyModel).where(PackagingSupplyModel.item_id == item_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_creation_detail(self, item_id: int) -> Optional[PackagingSupplyDetailData]:
        stmt = (
            select(
                ItemModel.id.label("id"),
                ItemModel.name.label("name"),
                BrandModel.name.label("brand_name"),
                UomModel.symbol.label("base_uom_symbol"),
                ItemModel.min_stock_level.label("min_stock_level"),
                PackagingSupplyModel.packaging_type.label("packaging_type"),
                PackagingSupplyModel.material.label("material"),
                PackagingSupplyModel.capacity_ml.label("capacity_ml"),
            )
            .join(PackagingSupplyModel, PackagingSupplyModel.item_id == ItemModel.id)
            .join(BrandModel, BrandModel.id == ItemModel.brand_id)
            .join(UomModel, UomModel.id == ItemModel.base_uom_id)
            .where(ItemModel.id == item_id)
        )

        result = await self._session.execute(stmt)
        row = result.one_or_none()

        if row is None:
            return None

        return PackagingSupplyDetailData(
            id=row.id,
            name=row.name,
            brand_name=row.brand_name,
            base_uom_symbol=row.base_uom_symbol,
            min_stock_level=Decimal(str(row.min_stock_level)),
            packaging_type=row.packaging_type,
            material=row.material,
            capacity_ml=Decimal(str(row.capacity_ml)) if row.capacity_ml is not None else None,
        )

    async def list_active_packaging_supplies_general(self) -> list[dict]:
        balance_totals = (
            select(
                InventoryBalanceModel.item_id.label("item_id"),
                func.sum(InventoryBalanceModel.quantity).label("stock_total"),
            )
            .where(InventoryBalanceModel.quantity > 0)
            .group_by(InventoryBalanceModel.item_id)
            .subquery()
        )

        stmt = (
            select(
                ItemModel.id.label("id"),
                ItemModel.name.label("name"),
                BrandModel.name.label("brand_name"),
                UomModel.symbol.label("base_uom_symbol"),
                ItemModel.min_stock_level.label("min_stock_level"),
                PackagingSupplyModel.packaging_type.label("packaging_type"),
                PackagingSupplyModel.material.label("material"),
                PackagingSupplyModel.capacity_ml.label("capacity_ml"),
                func.coalesce(balance_totals.c.stock_total, 0).label("stock_total"),
            )
            .join(PackagingSupplyModel, PackagingSupplyModel.item_id == ItemModel.id)
            .join(BrandModel, BrandModel.id == ItemModel.brand_id)
            .join(UomModel, UomModel.id == ItemModel.base_uom_id)
            .outerjoin(balance_totals, balance_totals.c.item_id == ItemModel.id)
            .where(ItemModel.status == "ACTIVE")
            .order_by(ItemModel.name.asc())
        )

        result = await self._session.execute(stmt)
        rows = result.all()

        return [
            {
                "id": row.id,
                "name": row.name,
                "brand_name": row.brand_name,
                "base_uom_symbol": row.base_uom_symbol,
                "min_stock_level": row.min_stock_level,
                "packaging_type": row.packaging_type,
                "material": row.material,
                "capacity_ml": Decimal(str(row.capacity_ml)) if row.capacity_ml is not None else None,
                "stock_total": float(row.stock_total),
            }
            for row in rows
        ]
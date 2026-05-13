# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE INSUMOS
# ══════════════════════════════════════════════════════════════════════════════

from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select

from src.domain.entities.supply import Supply
from src.domain.repositories.supply_repository import ISupplyRepository
from src.infrastructure.database.models.inventory_balance_model import InventoryBalanceModel
from src.infrastructure.database.models.brand_model import BrandModel
from src.infrastructure.database.models.item_model import ItemModel
from src.infrastructure.database.models.supply_model import SupplyModel
from src.infrastructure.database.models.uom_model import UomModel


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

    async def list_active_supplies_general(self) -> list[dict[str, Any]]:
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
                SupplyModel.supply_category.label("supply_category"),
                func.coalesce(balance_totals.c.stock_total, 0).label("stock_total"),
            )
            .join(SupplyModel, SupplyModel.item_id == ItemModel.id)
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
                "supply_category": row.supply_category,
                "stock_total": row.stock_total,
            }
            for row in rows
        ]

    async def get_active_supply_detail(self, item_id: int) -> Optional[dict[str, Any]]:
        stock_total_subquery = (
            select(func.sum(InventoryBalanceModel.quantity))
            .where(
                InventoryBalanceModel.item_id == item_id,
                InventoryBalanceModel.quantity > 0,
            )
            .scalar_subquery()
        )

        item_stmt = (
            select(
                ItemModel.id.label("id"),
                ItemModel.name.label("name"),
                ItemModel.item_type_id.label("item_type_id"),
                ItemModel.brand_id.label("brand_id"),
                UomModel.symbol.label("base_uom_symbol"),
                ItemModel.min_stock_level.label("min_stock_level"),
                ItemModel.created_at.label("item_created_at"),
                ItemModel.updated_at.label("item_updated_at"),
                ItemModel.deleted_at.label("item_deleted_at"),
                SupplyModel.supply_category.label("supply_category"),
                SupplyModel.updated_at.label("supply_updated_at"),
                func.coalesce(stock_total_subquery, 0).label("stock_total"),
                InventoryBalanceModel.lot_id.label("lot_id"),
            )
            .join(SupplyModel, SupplyModel.item_id == ItemModel.id)
            .join(UomModel, UomModel.id == ItemModel.base_uom_id)
            .outerjoin(InventoryBalanceModel, InventoryBalanceModel.item_id == ItemModel.id)
            .where(ItemModel.id == item_id, ItemModel.status == "ACTIVE")
        )
        item_result = await self._session.execute(item_stmt)
        row = item_result.one_or_none()
        if row is None:
            return None

        return {
            "id": row.id,
            "name": row.name,
            "item_type_id": row.item_type_id,
            "brand_id": row.brand_id,
            "base_uom_symbol": row.base_uom_symbol,
            "min_stock_level": row.min_stock_level,
            "supply_category": row.supply_category,
            "stock_total": row.stock_total,
            "created_at": row.item_created_at,
            "item_updated_at": row.item_updated_at,
            "supply_updated_at": row.supply_updated_at,
            "deleted_at": row.item_deleted_at,
            "lot_id": row.lot_id,
        }

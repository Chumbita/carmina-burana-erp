from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import case, func, literal, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.models.inventory_balance_model import InventoryBalanceModel
from src.infrastructure.database.models.inventory_lot_model import InventoryLotModel
from src.infrastructure.database.models.item_model import ItemModel
from src.infrastructure.database.models.item_type_model import ItemTypeModel
from src.infrastructure.database.models.packaging_supply_model import PackagingSupplyModel
from src.infrastructure.database.models.supplier_model import SupplierModel
from src.infrastructure.database.models.supply_entry_line_model import SupplyEntryLineModel
from src.infrastructure.database.models.supply_entry_order_model import SupplyEntryOrderModel
from src.infrastructure.database.models.supply_model import SupplyModel
from src.infrastructure.database.models.uom_model import UomModel


class InventoryDashboardRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_dashboard(self) -> dict[str, Any]:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        expires_before = now + timedelta(days=30)

        stock_rows = await self._stock_rows(now)
        expiring_rows = await self._expiring_rows(now, expires_before)
        recent_entry_rows = await self._recent_entry_rows()

        return self._build_dashboard(now, stock_rows, expiring_rows, recent_entry_rows)

    async def _stock_rows(self, now: datetime) -> list[Any]:
        balance_totals = (
            select(
                InventoryBalanceModel.item_id.label("item_id"),
                func.sum(InventoryBalanceModel.quantity).label("stock_total"),
            )
            .join(InventoryLotModel, InventoryLotModel.id == InventoryBalanceModel.lot_id)
            .where(
                InventoryBalanceModel.quantity > 0,
                or_(
                    InventoryLotModel.expiration_date.is_(None),
                    InventoryLotModel.expiration_date >= now,
                ),
            )
            .group_by(InventoryBalanceModel.item_id)
            .subquery()
        )

        category = func.coalesce(SupplyModel.supply_category, PackagingSupplyModel.packaging_type)
        area = case(
            (PackagingSupplyModel.item_id.isnot(None), literal("packaging")),
            else_=literal("production"),
        )

        stmt = (
            select(
                ItemModel.id.label("id"),
                ItemModel.name.label("name"),
                category.label("category"),
                area.label("area"),
                ItemModel.min_stock_level.label("min_stock_level"),
                UomModel.symbol.label("base_uom_symbol"),
                func.coalesce(balance_totals.c.stock_total, 0).label("stock_total"),
            )
            .join(ItemTypeModel, ItemTypeModel.id == ItemModel.item_type_id)
            .join(UomModel, UomModel.id == ItemModel.base_uom_id)
            .outerjoin(SupplyModel, SupplyModel.item_id == ItemModel.id)
            .outerjoin(PackagingSupplyModel, PackagingSupplyModel.item_id == ItemModel.id)
            .outerjoin(balance_totals, balance_totals.c.item_id == ItemModel.id)
            .where(
                ItemModel.status == "ACTIVE",
                ItemModel.is_stockable.is_(True),
                ItemTypeModel.code.in_(["supply", "packaging_supply"]),
            )
        )

        result = await self._session.execute(stmt)
        return result.all()

    async def _expiring_rows(self, now: datetime, expires_before: datetime) -> list[Any]:
        stmt = (
            select(
                InventoryLotModel.id.label("lot_id"),
                InventoryLotModel.item_id.label("item_id"),
                ItemModel.name.label("item_name"),
                InventoryLotModel.lot_code.label("lot_code"),
                InventoryLotModel.expiration_date.label("expiration_date"),
                InventoryBalanceModel.quantity.label("quantity"),
                UomModel.symbol.label("base_uom_symbol"),
            )
            .join(ItemModel, ItemModel.id == InventoryLotModel.item_id)
            .join(ItemTypeModel, ItemTypeModel.id == ItemModel.item_type_id)
            .join(UomModel, UomModel.id == ItemModel.base_uom_id)
            .join(InventoryBalanceModel, InventoryBalanceModel.lot_id == InventoryLotModel.id)
            .where(
                ItemModel.status == "ACTIVE",
                ItemModel.is_stockable.is_(True),
                ItemTypeModel.code.in_(["supply", "packaging_supply"]),
                InventoryBalanceModel.quantity > 0,
                InventoryLotModel.expiration_date.isnot(None),
                InventoryLotModel.expiration_date >= now,
                InventoryLotModel.expiration_date <= expires_before,
            )
            .order_by(InventoryLotModel.expiration_date.asc())
        )

        result = await self._session.execute(stmt)
        return result.all()

    async def _recent_entry_rows(self) -> list[Any]:
        line_counts = (
            select(
                SupplyEntryLineModel.supply_entry_id.label("supply_entry_id"),
                func.count(SupplyEntryLineModel.id).label("items_count"),
                func.sum(
                    SupplyEntryLineModel.quantity * SupplyEntryLineModel.unit_cost
                ).label("total_cost"),
            )
            .group_by(SupplyEntryLineModel.supply_entry_id)
            .subquery()
        )

        stmt = (
            select(
                SupplyEntryOrderModel.id.label("id"),
                SupplyEntryOrderModel.document_number.label("document_number"),
                SupplierModel.name.label("supplier_name"),
                SupplyEntryOrderModel.entry_date.label("entry_date"),
                SupplyEntryOrderModel.status.label("status"),
                func.coalesce(line_counts.c.items_count, 0).label("items_count"),
                func.coalesce(line_counts.c.total_cost, 0).label("total_cost"),
            )
            .outerjoin(SupplierModel, SupplierModel.id == SupplyEntryOrderModel.supplier_id)
            .outerjoin(line_counts, line_counts.c.supply_entry_id == SupplyEntryOrderModel.id)
            .where(SupplyEntryOrderModel.status != "CANCELED")
            .order_by(SupplyEntryOrderModel.entry_date.desc(), SupplyEntryOrderModel.created_at.desc())
            .limit(5)
        )

        result = await self._session.execute(stmt)
        return result.all()

    @staticmethod
    def _build_dashboard(
        now: datetime,
        stock_rows: list[Any],
        expiring_rows: list[Any],
        recent_entry_rows: list[Any],
    ) -> dict[str, Any]:
        status_counts = {"Sin stock": 0, "Crítico": 0, "Bajo": 0, "Óptimo": 0}
        category_totals: dict[str, Decimal] = {}
        top_low_stock = []
        summary = {
            "active": len(stock_rows),
            "out_of_stock": 0,
            "critical": 0,
            "low": 0,
            "optimal": 0,
            "packaging": 0,
            "production": 0,
        }

        for row in stock_rows:
            stock = Decimal(str(row.stock_total or 0))
            minimum = Decimal(str(row.min_stock_level or 0))
            coverage = stock / minimum if minimum > 0 else Decimal("1")
            status = InventoryDashboardRepository._stock_status(stock, minimum, coverage)
            status_counts[status] += 1
            summary[InventoryDashboardRepository._summary_key(status)] += 1
            summary["packaging" if row.area == "packaging" else "production"] += 1

            category = row.category or "Sin categoría"
            category_totals[category] = category_totals.get(category, Decimal("0")) + stock

            if status != "Óptimo":
                top_low_stock.append(
                    {
                        "id": row.id,
                        "item_id": row.id,
                        "item_name": row.name,
                        "stock_total": stock,
                        "min_stock_level": minimum,
                        "coverage": coverage,
                        "status": status,
                        "uom_symbol": row.base_uom_symbol,
                    }
                )

        expires_before = now + timedelta(days=30)
        return {
            "summary": summary,
            "stock_by_status": [
                {"status": status, "count": count}
                for status, count in status_counts.items()
            ],
            "stock_by_category": [
                {"category": category, "stock_total": total}
                for category, total in sorted(category_totals.items())
            ],
            "top_low_stock": sorted(
                top_low_stock,
                key=lambda item: (item["coverage"], item["stock_total"], item["item_name"]),
            )[:5],
            "expiring_lots": [
                {
                    "id": row.lot_id,
                    "lot_id": row.lot_id,
                    "item_id": row.item_id,
                    "item_name": row.item_name,
                    "lot_code": row.lot_code,
                    "expiration_date": row.expiration_date,
                    "quantity": Decimal(str(row.quantity or 0)),
                    "uom_symbol": row.base_uom_symbol,
                }
                for row in expiring_rows
                if row.expiration_date and now <= row.expiration_date <= expires_before
            ],
            "recent_entries": [
                {
                    "id": row.id,
                    "document_number": row.document_number,
                    "supplier_name": row.supplier_name,
                    "entry_date": row.entry_date,
                    "status": row.status,
                    "items_count": row.items_count or 0,
                    "total_cost": Decimal(str(row.total_cost or 0)),
                }
                for row in recent_entry_rows
                if row.status != "CANCELED"
            ][:5],
        }

    @staticmethod
    def _stock_status(stock: Decimal, minimum: Decimal, coverage: Decimal) -> str:
        if stock <= 0:
            return "Sin stock"
        if minimum > 0 and coverage < Decimal("0.5"):
            return "Crítico"
        if minimum > 0 and stock < minimum:
            return "Bajo"
        return "Óptimo"

    @staticmethod
    def _summary_key(status: str) -> str:
        return {
            "Sin stock": "out_of_stock",
            "Crítico": "critical",
            "Bajo": "low",
            "Óptimo": "optimal",
        }[status]

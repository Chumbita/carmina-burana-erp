from datetime import datetime, timedelta, timezone
from math import ceil

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities.user import User
from src.infrastructure.database.deps import get_db
from src.infrastructure.database.models.inventory_balance_model import InventoryBalanceModel
from src.infrastructure.database.models.inventory_lot_model import InventoryLotModel
from src.infrastructure.database.models.item_model import ItemModel
from src.infrastructure.database.models.supply_model import SupplyModel
from src.infrastructure.database.models.uom_model import UomModel
from src.presentation.dependencies.auth import get_current_user
from src.presentation.schemas.notification_schemas import NotificationResponse


router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[NotificationResponse]:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    low_stock = await _low_stock_notifications(db, now)
    expiring_lots = await _expiring_lot_notifications(db, now)
    return low_stock + expiring_lots


async def _low_stock_notifications(db: AsyncSession, now: datetime) -> list[NotificationResponse]:
    stock_totals = (
        select(
            InventoryBalanceModel.item_id.label("item_id"),
            func.sum(InventoryBalanceModel.quantity).label("stock_total"),
        )
        .join(InventoryLotModel, InventoryLotModel.id == InventoryBalanceModel.lot_id)
        .where(
            InventoryBalanceModel.quantity > 0,
            or_(InventoryLotModel.expiration_date.is_(None), InventoryLotModel.expiration_date >= now),
        )
        .group_by(InventoryBalanceModel.item_id)
        .subquery()
    )

    stmt = (
        select(
            ItemModel.id,
            ItemModel.name,
            ItemModel.min_stock_level,
            UomModel.symbol,
            func.coalesce(stock_totals.c.stock_total, 0).label("stock_total"),
        )
        .join(SupplyModel, SupplyModel.item_id == ItemModel.id)
        .join(UomModel, UomModel.id == ItemModel.base_uom_id)
        .outerjoin(stock_totals, stock_totals.c.item_id == ItemModel.id)
        .where(ItemModel.status == "ACTIVE")
        .where(ItemModel.min_stock_level > 0)
        .where(func.coalesce(stock_totals.c.stock_total, 0) < ItemModel.min_stock_level)
        .order_by(ItemModel.name.asc())
    )

    rows = (await db.execute(stmt)).all()
    return [
        NotificationResponse(
            id=f"low-stock-{row.id}",
            type="warning",
            title=f"Stock bajo de {row.name}",
            message=f"El stock de {row.name} está por debajo del mínimo ({float(row.stock_total):g}{row.symbol} restantes)",
            time="Ahora",
            href=f"/inventario/insumos/{row.id}",
        )
        for row in rows
    ]


async def _expiring_lot_notifications(db: AsyncSession, now: datetime) -> list[NotificationResponse]:
    limit = now + timedelta(days=7)
    stmt = (
        select(
            InventoryLotModel.id,
            InventoryLotModel.lot_code,
            InventoryLotModel.expiration_date,
            ItemModel.id.label("item_id"),
            ItemModel.name,
        )
        .join(InventoryBalanceModel, InventoryBalanceModel.lot_id == InventoryLotModel.id)
        .join(ItemModel, ItemModel.id == InventoryLotModel.item_id)
        .join(SupplyModel, SupplyModel.item_id == ItemModel.id)
        .where(InventoryBalanceModel.quantity > 0)
        .where(InventoryLotModel.expiration_date.is_not(None))
        .where(InventoryLotModel.expiration_date >= now)
        .where(InventoryLotModel.expiration_date <= limit)
        .order_by(InventoryLotModel.expiration_date.asc())
    )

    rows = (await db.execute(stmt)).all()
    return [
        NotificationResponse(
            id=f"expiring-lot-{row.id}",
            type="alert",
            title="Insumo próximo a vencer",
            message=f"{row.name} {row.lot_code} vence en {_days_until(row.expiration_date, now)} días",
            time="Ahora",
            href=f"/inventario/insumos/{row.item_id}",
        )
        for row in rows
    ]


def _days_until(expiration_date: datetime, now: datetime) -> int:
    seconds = (expiration_date - now).total_seconds()
    return max(0, ceil(seconds / 86400))

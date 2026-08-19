from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any

from src.application.dtos.notifications.notification_dtos import GeneratedNotification
from src.domain.repositories.supply_repository import ISupplyRepository


class InventoryNotificationProvider:
    def __init__(self, supply_repository: ISupplyRepository) -> None:
        self._supply_repository = supply_repository

    async def list_notifications(self) -> list[GeneratedNotification]:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        low_stock = await self._list_low_stock_notifications(now)
        expiring_lots = await self._list_expiring_lot_notifications(now)
        return low_stock + expiring_lots

    async def _list_low_stock_notifications(self, now: datetime) -> list[GeneratedNotification]:
        rows = await self._supply_repository.list_active_supplies_general()
        return [
            GeneratedNotification(
                key=f"inventory.low-stock:{row['id']}",
                type="warning",
                title="Stock bajo",
                message=f"{row['name']} tiene {row['stock_total']} {row['base_uom_symbol']} disponibles.",
                href=f"/inventario/insumos/{row['id']}",
                created_at=now,
            )
            for row in rows
            if Decimal(str(row["stock_total"])) <= Decimal(str(row["min_stock_level"]))
        ]

    async def _list_expiring_lot_notifications(self, now: datetime) -> list[GeneratedNotification]:
        rows = await self._supply_repository.list_expiring_lots_for_active_supplies(now + timedelta(days=7))
        return [
            GeneratedNotification(
                key=f"inventory.expiring-lot:{row['lot_id']}",
                type="alert",
                title="Lote próximo a vencer",
                message=self._expiring_lot_message(row),
                href=f"/inventario/insumos/{row['item_id']}",
                created_at=row["expiration_date"],
            )
            for row in rows
        ]

    @staticmethod
    def _expiring_lot_message(row: dict[str, Any]) -> str:
        expires_on = row["expiration_date"].date().isoformat()
        return f"{row['item_name']} lote {row['lot_code']} vence el {expires_on}."

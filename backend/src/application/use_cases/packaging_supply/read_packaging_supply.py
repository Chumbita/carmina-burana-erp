# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA LISTAR/DETALLE DE PACKAGING SUPPLY
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime
from decimal import Decimal
from typing import Optional

from src.domain.repositories.packaging_supply_repository import IPackagingSupplyRepository
from src.domain.value_objects.stock_status import StockStatus
from src.domain.exceptions.item_exceptions import ItemNotFoundException


class ListActivePackagingSuppliesUseCase:
    def __init__(self, packaging_supply_repository: IPackagingSupplyRepository) -> None:
        self._repository = packaging_supply_repository

    async def execute(self) -> list[dict]:
        rows = await self._repository.list_active_packaging_supplies_general()
        response: list[dict] = []

        for row in rows:
            stock_total = float(row["stock_total"])
            min_stock_level = float(row["min_stock_level"])
            stock_status = StockStatus.from_levels(stock_total, min_stock_level)

            response.append(
                {
                    "id": row["id"],
                    "name": row["name"],
                    "brand_name": row["brand_name"],
                    "base_uom_symbol": row["base_uom_symbol"],
                    "min_stock_level": Decimal(row["min_stock_level"]),
                    "packaging_type": row["packaging_type"],
                    "material": row["material"],
                    "capacity_ml": row["capacity_ml"],
                    "stock_total": stock_total,
                    "estado_stock": stock_status.value,
                }
            )

        return response


class GetActivePackagingSupplyDetailUseCase:
    def __init__(self, packaging_supply_repository: IPackagingSupplyRepository) -> None:
        self._repository = packaging_supply_repository

    async def execute(self, item_id: int) -> dict:
        row = await self._repository.get_active_packaging_supply_detail(item_id)
        if row is None:
            raise ItemNotFoundException(item_id)

        stock_total = float(row["stock_total"])
        min_stock_level = float(row["min_stock_level"])
        stock_status = StockStatus.from_levels(stock_total, min_stock_level)
        updated_at = self._resolve_updated_at(row["item_updated_at"], row["ps_updated_at"], row["created_at"])

        return {
            "id": row["id"],
            "name": row["name"],
            "item_type": row["item_type_code"],
            "brand_id": row["brand_id"],
            "brand": row["brand_name"],
            "base_uom_id": row["base_uom_id"],
            "base_uom_symbol": row["base_uom_symbol"],
            "min_stock_level": Decimal(row["min_stock_level"]),
            "packaging_type": row["packaging_type"],
            "material": row["material"],
            "capacity_ml": row["capacity_ml"],
            "stock_total": stock_total,
            "estado_stock": stock_status.value,
            "created_at": row["created_at"],
            "updated_at": updated_at,
            "inventory_balance": [
                {"quantity": stock_total}
            ],
        }

    @staticmethod
    def _resolve_updated_at(
        item_updated_at: Optional[datetime],
        ps_updated_at: Optional[datetime],
        created_at: datetime,
    ) -> datetime:
        candidates = [value for value in (item_updated_at, ps_updated_at) if value is not None]
        if not candidates:
            return created_at
        return max(candidates)
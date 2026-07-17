from datetime import datetime
from decimal import Decimal

from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.domain.repositories.supply_repository import ISupplyRepository
from src.domain.value_objects.stock_status import StockStatus


class ListActiveSuppliesUseCase:
    def __init__(self, supply_repository: ISupplyRepository) -> None:
        self._supply_repository = supply_repository

    async def execute(self) -> list[dict]:
        rows = await self._supply_repository.list_active_supplies_general()
        response: list[dict] = []

        for row in rows:
            stock_total = float(row["stock_total"])
            min_stock_level = float(row["min_stock_level"])
            stock_status = StockStatus.from_levels(stock_total, min_stock_level)

            if row["item_type_code"] == "supply":
                name = row["name"]
                category = row["supply_category"] or ""
            else:
                suffix = f" {int(row['capacity_ml'])}ml" if row["capacity_ml"] else ""
                name = f"{row['name']}{suffix}"
                category = row["packaging_type"] or ""

            response.append(
                {
                    "id": row["id"],
                    "name": name,
                    "brand_name": row["brand_name"],
                    "base_uom_symbol": row["base_uom_symbol"],
                    "min_stock_level": Decimal(row["min_stock_level"]),
                    "category": category,
                    "item_type": row["item_type_code"].upper(),
                    "stock_total": stock_total,
                    "estado_stock": stock_status.value,
                }
            )

        return response


class GetActiveSupplyDetailUseCase:
    def __init__(self, supply_repository: ISupplyRepository) -> None:
        self._supply_repository = supply_repository

    async def execute(self, item_id: int) -> dict:
        row = await self._supply_repository.get_active_supply_detail(item_id)
        if row is None:
            raise ItemNotFoundException(item_id)

        stock_total = float(row["stock_total"])
        min_stock_level = float(row["min_stock_level"])
        stock_status = StockStatus.from_levels(stock_total, min_stock_level)
        updated_at = self._resolve_updated_at(row["item_updated_at"], row["supply_updated_at"], row["created_at"])

        return {
            "id": row["id"],
            "name": row["name"],
            "item_type": row["item_type_code"],
            "brand_id": row["brand_id"],
            "brand": row["brand_name"],
            "base_uom_id": row["base_uom_id"],
            "base_uom_symbol": row["base_uom_symbol"],
            "min_stock_level": Decimal(row["min_stock_level"]),
            "supply_category": row["supply_category"],
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
        item_updated_at: datetime | None,
        supply_updated_at: datetime | None,
        created_at: datetime,
    ) -> datetime:
        candidates = [value for value in (item_updated_at, supply_updated_at) if value is not None]
        if not candidates:
            return created_at
        return max(candidates)

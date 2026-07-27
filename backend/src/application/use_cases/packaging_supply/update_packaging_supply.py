from datetime import datetime
from typing import Optional

from src.application.dtos.items.item_commands_dtos import UpdateItemCommand
from src.application.use_cases.item.update_item_use_case import UpdateItemUseCase
from src.domain.repositories.packaging_supply_repository import IPackagingSupplyRepository
from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.domain.value_objects.stock_status import StockStatus


class UpdatePackagingSupplyUseCase:

    def __init__(
        self,
        update_item_use_case: UpdateItemUseCase,
        packaging_supply_repository: IPackagingSupplyRepository,
    ) -> None:
        self._update_item_use_case = update_item_use_case
        self._repository = packaging_supply_repository

    async def execute(self, command: UpdateItemCommand) -> dict:
        await self._update_item_use_case.execute(command)

        row = await self._repository.get_active_packaging_supply_detail(command.item_id)
        if row is None:
            raise ItemNotFoundException(command.item_id)

        stock_total = float(row["stock_total"])
        min_stock_level = float(row["min_stock_level"])
        stock_status = StockStatus.from_levels(stock_total, min_stock_level)
        updated_at = self._resolve_updated_at(
            row["item_updated_at"], row["ps_updated_at"], row["created_at"]
        )

        return {
            "id": row["id"],
            "name": row["name"],
            "item_type": row["item_type_code"],
            "brand": row["brand_name"],
            "base_uom_symbol": row["base_uom_symbol"],
            "min_stock_level": row["min_stock_level"],
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

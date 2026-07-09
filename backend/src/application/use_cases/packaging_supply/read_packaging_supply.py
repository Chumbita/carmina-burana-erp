# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA LISTAR/DETALLE DE PACKAGING SUPPLY
# ══════════════════════════════════════════════════════════════════════════════

from decimal import Decimal

from src.domain.repositories.packaging_supply_repository import IPackagingSupplyRepository
from src.domain.value_objects.stock_status import StockStatus


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
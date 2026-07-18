# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO: OBTENER ORDEN DE PRODUCCIÓN
# ══════════════════════════════════════════════════════════════════════════════
from src.domain.repositories.production_order_repository import IProductionOrderRepository

class ListIncompleteProductionsUseCase:
    def __init__(self, production_order_repository: IProductionOrderRepository) -> None:
        self._production_order_repository = production_order_repository

    async def execute(self) -> list[dict]:
        rows = await self._production_order_repository.get_all_incomplete()
        response: list[dict] = []

        for row in rows:
            response.append(
                {
                    "id": row["id"],
                    "item_name": row["item_name"], 
                    "bom_version": row["bom_version"],
                    "planned_quantity": float(row["planned_quantity"]),
                    "base_uom_symbol": row["base_uom_symbol"],
                    "schedule_date": row["schedule_date"],
                    "status": row["status"],
                }
            )

        return response
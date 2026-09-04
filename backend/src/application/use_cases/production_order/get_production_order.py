# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO: OBTENER ORDEN DE PRODUCCIÓN
# ══════════════════════════════════════════════════════════════════════════════
from decimal import Decimal

from src.domain.repositories.production_order_repository import IProductionOrderRepository
from src.domain.repositories.bom_repository import IBomRepository
from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.domain.repositories.inventory_lot_repository import IInventoryLotRepository
from src.domain.services.production_stock_service import ProductionStockService
from src.shared.pagination import Page, PaginationParams


class ListIncompleteProductionsUseCase:
    def __init__(
        self,
        production_order_repository: IProductionOrderRepository,
        bom_repository: IBomRepository,
        balance_repository: IInventoryBalanceRepository,
        lot_repository: IInventoryLotRepository,
    ) -> None:
        self._production_order_repository = production_order_repository
        self._bom_repository = bom_repository
        self._stock_service = ProductionStockService(balance_repository, lot_repository)

    async def execute(
        self,
        params: PaginationParams,
        *,
        q: str | None = None,
        sort_by: str = "schedule_date",
        sort_order: str = "asc",
    ) -> Page[dict]:
        rows, total = await self._production_order_repository.list_incomplete_paginated(
            offset=params.offset,
            limit=params.limit,
            q=q,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        response: list[dict] = []
        for row in rows:
            estimated_unit_cost: Decimal = Decimal("0")
            bom = await self._bom_repository.get_detailed_bom_by_id(row["bom_id"])
            if bom is not None:
                estimated_unit_cost = await self._stock_service.calculate_unit_cost(
                    bom=bom,
                    planned_quantity=row["planned_quantity"],
                )

            response.append(
                {
                    "id": row["id"],
                    "item_name": row["item_name"],
                    "bom_version": row["bom_version"],
                    "planned_quantity": float(row["planned_quantity"]),
                    "base_uom_symbol": row["base_uom_symbol"],
                    "schedule_date": row["schedule_date"],
                    "status": row["status"],
                    "estimated_unit_cost": estimated_unit_cost,
                }
            )

        return Page(items=response, total_items=total, params=params)


class ListFinishedProductionsUseCase:
    """
    Lista las órdenes de producción que no están en estado PLANNED
    (historial de cocciones).
    """

    def __init__(
        self,
        production_order_repository: IProductionOrderRepository,
    ) -> None:
        self._production_order_repository = production_order_repository

    async def execute(
        self,
        params: PaginationParams,
        *,
        q: str | None = None,
        status: str | None = None,
        date_field: str | None = None,
        date_from: str | None = None,
        date_to: str | None = None,
        sort_by: str = "production_date",
        sort_order: str = "desc",
    ) -> Page[dict]:
        rows, total = await self._production_order_repository.list_history_paginated(
            offset=params.offset,
            limit=params.limit,
            q=q,
            status=status,
            date_field=date_field,
            date_from=date_from,
            date_to=date_to,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        items = [
            {
                "id": row["id"],
                "item_name": row["item_name"],
                "bom_version": row["bom_version"],
                "produced_quantity": float(row["produced_quantity"]),
                "base_uom_symbol": row["base_uom_symbol"],
                "schedule_date": row["schedule_date"],
                "completed_at": row["completed_at"],
                "status": row["status"],
            }
            for row in rows
        ]

        return Page(items=items, total_items=total, params=params)

# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO: OBTENER DETALLE DE ORDEN DE PRODUCCIÓN POR ID
# ══════════════════════════════════════════════════════════════════════════════

from src.application.dtos.production_order.production_order_responses_dtos import (
    ProductionOrderDetailResponse,
)
from src.domain.repositories.production_order_repository import IProductionOrderRepository
from src.domain.repositories.bom_repository import IBomRepository
from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.domain.repositories.inventory_lot_repository import IInventoryLotRepository
from src.domain.services.production_stock_service import ProductionStockService
from src.domain.exceptions.production_exceptions import ProductionOrderNotFoundException
from src.domain.value_objects.production_order_status import ProductionOrderStatus


class GetProductionOrderByIdUseCase:

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

    async def execute(self, order_id: int) -> ProductionOrderDetailResponse:
        data = await self._production_order_repository.get_detailed_production_order_by_id(order_id)

        if data is None:
            raise ProductionOrderNotFoundException(order_id)

        bom = await self._bom_repository.get_detailed_bom_by_id(data["bom_id"])

        # Para órdenes planificadas se incluyen los insumos que la
        # producción va a ocupar (cantidades escaladas a la cantidad
        # planificada de la orden).
        if data["status"] == ProductionOrderStatus.PLANNED.value and bom is not None:
            data["ingredients"] = await self._stock_service.calculate_required_ingredients(
                bom=bom,
                planned_quantity=data["planned_quantity"],
            )

        # El costo unitario es siempre el estimado según los insumos
        # actuales de la receta, independientemente del estado.
        if bom is not None:
            data["unit_cost"] = await self._stock_service.calculate_unit_cost(
                bom=bom,
                planned_quantity=data["planned_quantity"],
            )

        return ProductionOrderDetailResponse.from_dict(data)

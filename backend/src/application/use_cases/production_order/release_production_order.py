# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO: LIBERAR ORDEN DE PRODUCCIÓN
# ══════════════════════════════════════════════════════════════════════════════

from decimal import Decimal

from src.domain.repositories.production_order_repository import IProductionOrderRepository
from src.domain.repositories.bom_repository import IBomRepository
from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.domain.exceptions.production_exceptions import (
    ProductionOrderNotFoundException,
    InsufficientStockForProductionException,
    BomNotFoundException,
)


class ReleaseProductionOrderUseCase:
    """
    Verifica que hay stock suficiente para ejecutar la producción
    y pasa la orden de PLANNED a RELEASED.

    FLUJO:
        1. Obtener la orden y verificar que existe.
        2. Obtener la BOM activa con sus líneas.
        3. Por cada bom_line, calcular la cantidad requerida
           (effective_quantity × escala) y verificar stock disponible.
        4. Si algún insumo no tiene stock suficiente → bloquear
           y retornar los faltantes.
        5. Si todo OK → order.release() y persistir.
    """

    def __init__(
        self,
        production_order_repository: IProductionOrderRepository,
        bom_repository: IBomRepository,
        balance_repository: IInventoryBalanceRepository,
    ) -> None:
        self._production_order_repository = production_order_repository
        self._bom_repository = bom_repository
        self._balance_repository = balance_repository

    async def execute(self, order_id: int):

        # 1. Obtener la orden
        order = await self._production_order_repository.get_by_id(order_id)
        if order is None:
            raise ProductionOrderNotFoundException(order_id)

        # 2. Obtener la BOM
        bom = await self._bom_repository.get_by_id(order.bom_id)
        if bom is None:
            raise BomNotFoundException(order.bom_id)

        # 3. Calcular requerimientos: cada línea del BOM representa la cantidad
        #    necesaria por unidad del producto final, en unidad base.
        missing = []
        for line in bom.lines:
            required = line.effective_quantity() * order.planned_quantity
            available = await self._balance_repository.get_total_available_by_item(
                line.component_item_id
            )
            if available < required:
                missing.append({
                    "item_id": line.component_item_id,
                    "required": required,
                    "available": available,
                })

        if missing:
            raise InsufficientStockForProductionException(order_id, missing)

        # 5. Liberar la orden
        order.release()
        await self._production_order_repository.save(order)
        return order
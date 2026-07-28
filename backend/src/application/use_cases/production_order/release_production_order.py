# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO: LIBERAR ORDEN DE PRODUCCIÓN
# ══════════════════════════════════════════════════════════════════════════════

from decimal import Decimal

from src.domain.repositories.production_order_repository import IProductionOrderRepository
from src.domain.repositories.bom_repository import IBomRepository
from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.domain.repositories.inventory_lot_repository import IInventoryLotRepository
from src.domain.entities.production_order import ProductionOrder
from src.domain.exceptions.production_exceptions import (
    ProductionOrderNotFoundException,
    InsufficientStockForProductionException,
    BomNotFoundException,
)


class ReleaseProductionOrderUseCase:
    """
    Verifica que hay stock suficiente para ejecutar la producción,
    reserva el stock necesario y pasa la orden de PLANNED a RELEASED.

    FLUJO:
        1. Obtener la orden y la BOM.
        2. Calcular escala: planned_quantity / bom.quantity.
        3. Por cada bom_line, calcular cantidad requerida y verificar
           stock disponible (quantity - reserved_quantity).
        4. Si algún insumo no tiene stock suficiente → bloquear
           y retornar los faltantes. No se reserva nada.
        5. Si todo OK → reservar stock lote por lote (FEFO).
        6. order.release() y persistir.
    """

    def __init__(
        self,
        production_order_repository: IProductionOrderRepository,
        bom_repository: IBomRepository,
        balance_repository: IInventoryBalanceRepository,
        lot_repository: IInventoryLotRepository,
    ) -> None:
        self._production_order_repository = production_order_repository
        self._bom_repository = bom_repository
        self._balance_repository = balance_repository
        self._lot_repository = lot_repository

    async def execute(self, order_id: int) -> ProductionOrder:

        # 1. Obtener la orden y la BOM
        order = await self._production_order_repository.get_by_id(order_id)
        if order is None:
            raise ProductionOrderNotFoundException(order_id)

        bom = await self._bom_repository.get_by_id(order.bom_id)
        if bom is None:
            raise BomNotFoundException(order.bom_id)

        # 2. Calcular escala
        scale = order.planned_quantity / bom.quantity

        # 3. Verificar stock disponible por cada línea antes de reservar
        missing = []
        for line in bom.lines:
            required = line.quantity * scale
            available = await self._balance_repository.get_total_available_by_item(
                line.component_item_id
            )
            if available < required:
                missing.append({
                    "item_id": line.component_item_id,
                    "required": required,
                    "available": available,
                })

        # 4. Si falta stock → bloquear sin reservar nada
        if missing:
            raise InsufficientStockForProductionException(order_id, missing)

        # 5. Reservar stock lote por lote por FEFO
        for line in bom.lines:
            remaining = line.quantity * scale
            lots = await self._lot_repository.get_available_by_item_fefo(
                line.component_item_id
            )

            for lot in lots:
                if remaining <= Decimal("0"):
                    break

                balance = await self._balance_repository.get_by_lot(
                    line.component_item_id, lot.id
                )
                if balance is None or balance.is_depleted:
                    continue

                to_reserve = min(balance.available_quantity, remaining)
                balance.reserve(to_reserve)
                await self._balance_repository.save(balance)

                remaining -= to_reserve

        # 6. Liberar la orden
        order.release()
        await self._production_order_repository.save(order)
        return order
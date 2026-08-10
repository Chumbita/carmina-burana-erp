# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO: DESCARTAR ORDEN DE PRODUCCIÓN
# ══════════════════════════════════════════════════════════════════════════════

from decimal import Decimal
from typing import Optional

from src.domain.entities.production_order import ProductionOrder
from src.domain.repositories.production_order_repository import IProductionOrderRepository
from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.application.dtos.inventory_movement_dtos import InventoryMovementCommand
from src.application.use_cases.inventory.inventory_movement_use_case import InventoryMovementUseCase
from src.domain.value_objects.production_order_status import ProductionOrderStatus
from src.domain.value_objects.inventory_transaction_enums import TransactionType
from src.domain.exceptions.production_exceptions import (
    ProductionOrderNotFoundException,
    ProductionOrderCannotBeDiscardedException,
)


class DiscardProductionOrderUseCase:
    """
    Descarta una orden de producción en estado DONE.
    Pasa a DISCARDED y guarda un motivo breve en la descripción.

    ESCENARIO: la cocción salió mal. Los insumos ya fueron consumidos
    (los consumos no se revierten) pero el lote producido es fallido
    y no debe contar en el inventario. Por lo tanto el descarte
    descontá del balance la cantidad disponible de cada lote de output.

    FLUJO:
        1. Obtener la orden y verificar que esté en DONE.
        2. Por cada lote de output, descontar del balance lo que
           aún esté disponible (PRODUCTION_DISCARD). Si el lote ya
           fue consumido/vendido en parte, se descuenta solo el
           saldo restante.
        3. Cambiar estado a DISCARDED y registrar el motivo.
        4. Persistir.
    """

    def __init__(
        self,
        production_order_repository: IProductionOrderRepository,
        balance_repository: IInventoryBalanceRepository,
        inventory_movement_use_case: InventoryMovementUseCase,
    ) -> None:
        self._production_order_repository = production_order_repository
        self._balance_repository = balance_repository
        self._inventory_movement = inventory_movement_use_case

    async def execute(
        self,
        order_id: int,
        description: Optional[str] = None,
    ) -> ProductionOrder:

        # 1. Obtener la orden y verificar estado
        order = await self._production_order_repository.get_by_id(order_id)
        if order is None:
            raise ProductionOrderNotFoundException(order_id)

        if order.status != ProductionOrderStatus.DONE:
            raise ProductionOrderCannotBeDiscardedException(
                order_id, order.status.value
            )

        # 2. Descontar del balance cada lote de output producido
        await self._discard_output_lots(order)

        # 3. Cambiar estado y registrar el motivo
        order.discard()
        if description is not None:
            order.description = description

        # 4. Persistir
        await self._production_order_repository.save(order)
        return order

    async def _discard_output_lots(self, order: ProductionOrder) -> None:
        """
        Por cada lote de output, registra un movimiento PRODUCTION_DISCARD
        por la cantidad aún disponible en el balance.

        - Balance sin stock disponible → se omite (nada que descontar).
        - Balance con saldo total → se descuenta la cantidad producida.
        - Balance parcialmente consumido → se descuenta solo lo disponible,
          sin dejar un balance inválido.
        """
        for output in order.outputs:
            balance = await self._balance_repository.get_by_lot(
                output.item_id, output.lot_id
            )
            if balance is None:
                continue

            available = balance.available_quantity
            if available <= Decimal("0"):
                continue

            await self._inventory_movement.execute(
                InventoryMovementCommand(
                    item_id=output.item_id,
                    transaction_type=TransactionType.PRODUCTION_DISCARD,
                    quantity=available,
                    reference_type="production_order",
                    reference_id=order.id,
                    lot_id=output.lot_id,
                )
            )

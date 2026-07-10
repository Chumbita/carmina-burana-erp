# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO: INICIAR ORDEN DE PRODUCCIÓN
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime, timezone
from decimal import Decimal

from src.domain.entities.production_order import ProductionConsumption, ProductionOrder
from src.domain.repositories.production_order_repository import IProductionOrderRepository
from src.domain.repositories.bom_repository import IBomRepository
from src.domain.repositories.inventory_lot_repository import IInventoryLotRepository
from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.application.dtos.inventory_movement_dtos import InventoryMovementCommand
from src.application.use_cases.inventory.inventory_movement_use_case import InventoryMovementUseCase
from src.domain.value_objects.inventory_transaction_enums import TransactionType
from src.domain.exceptions.production_exceptions import (
    ProductionOrderNotFoundException,
    BomNotFoundException,
    InsufficientStockForProductionException,
)


class StartProductionOrderUseCase:
    """
    Inicia la ejecución de una orden de producción.
    Pasa de RELEASED a IN_PROGRESS.

    FLUJO:
        1. Obtener la orden y la BOM.
        2. Calcular escala.
        3. Por cada bom_line, seleccionar lotes por FEFO.
        4. Por cada lote:
            a. Liberar la reserva (release_reservation).
            b. Ejecutar InventoryMovementUseCase con PRODUCTION_CONSUMITION
               → descuenta quantity y registra transacción.
        5. Registrar ProductionConsumption por cada lote consumido.
        6. Pasar la orden a IN_PROGRESS.
    """

    def __init__(
        self,
        production_order_repository: IProductionOrderRepository,
        bom_repository: IBomRepository,
        lot_repository: IInventoryLotRepository,
        balance_repository: IInventoryBalanceRepository,
        inventory_movement_use_case: InventoryMovementUseCase,
    ) -> None:
        self._production_order_repository = production_order_repository
        self._bom_repository = bom_repository
        self._lot_repository = lot_repository
        self._balance_repository = balance_repository
        self._inventory_movement = inventory_movement_use_case

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

        # 3. Por cada línea de la BOM, seleccionar lotes FEFO y consumir
        consumptions = []
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
                if balance is None:
                    continue

                # La cantidad a consumir es lo que estaba reservado de este lote
                # o lo que queda por consumir, lo que sea menor
                to_consume = min(balance.reserved_quantity, remaining)
                if to_consume <= Decimal("0"):
                    continue

                # 4a. Liberar la reserva
                balance.release_reservation(to_consume)
                await self._balance_repository.save(balance)

                # 4b. Descontar inventario real y registrar transacción
                await self._inventory_movement.execute(
                    InventoryMovementCommand(
                        item_id=line.component_item_id,
                        transaction_type=TransactionType.PRODUCTION_CONSUMITION,
                        quantity=to_consume,
                        reference_type="production_order",
                        reference_id=order.id,
                        lot_id=lot.id,
                    )
                )

                # 5. Registrar consumption
                consumptions.append(
                    ProductionConsumption(
                        item_id=line.component_item_id,
                        lot_id=lot.id,
                        quantity=to_consume,
                        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                        production_order_id=order.id,
                    )
                )

                remaining -= to_consume

            if remaining > Decimal("0"):
                raise InsufficientStockForProductionException(
                    order_id,
                    [{"item_id": line.component_item_id, "missing": remaining}],
                )

        # 6. Persistir consumptions y cambiar estado
        order.consumptions = consumptions
        await self._production_order_repository.add_consumptions(order)
        order.start()
        await self._production_order_repository.save(order)
        return order
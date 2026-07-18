# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO: COMPLETAR ORDEN DE PRODUCCIÓN
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime, timezone
from decimal import Decimal

from src.domain.entities.production_order import ProductionOutput
from src.domain.entities.production_order import ProductionOrder
from src.domain.repositories.production_order_repository import IProductionOrderRepository
from src.application.dtos.inventory_movement_dtos import InventoryMovementCommand
from src.application.use_cases.inventory.inventory_movement_use_case import InventoryMovementUseCase
from src.domain.value_objects.inventory_transaction_enums import TransactionType
from src.application.dtos.inventory_lot_dtos import NewLotData
from src.domain.exceptions.production_exceptions import ProductionOrderNotFoundException


class CompleteProductionOrderUseCase:
    """
    Cierra una orden de producción.
    Pasa de IN_PROGRESS a DONE.

    FLUJO:
        1. Obtener la orden y verificar estado.
        2. Ejecutar InventoryMovementUseCase con PRODUCTION_OUTPUT
           → crea un nuevo lote del ítem producido y acredita balance.
           → retorna el lot_id del lote creado.
        3. Registrar ProductionOutput con ese lot_id.
        4. Marcar la orden como DONE con la cantidad producida real.
    """

    def __init__(
        self,
        production_order_repository: IProductionOrderRepository,
        inventory_movement_use_case: InventoryMovementUseCase,
    ) -> None:
        self._production_order_repository = production_order_repository
        self._inventory_movement = inventory_movement_use_case

    async def execute(
        self,
        order_id: int,
        produced_quantity: Decimal,
        lot_code: str,
        unit_cost: Decimal,
        production_date=None,
        expiration_date=None,
    ) -> ProductionOrder:

        now = datetime.now(timezone.utc).replace(tzinfo=None)

        # 1. Obtener la orden
        order = await self._production_order_repository.get_by_id(order_id)
        if order is None:
            raise ProductionOrderNotFoundException(order_id)

        # 2. Crear lote output y acreditar inventario
        # execute() retorna el lot_id del lote creado
        lot_id = await self._inventory_movement.execute(
            InventoryMovementCommand(
                item_id=order.item_id,
                transaction_type=TransactionType.PRODUCTION_OUTPUT,
                quantity=produced_quantity,
                reference_type="production_order",
                reference_id=order.id,
                new_lot_data=NewLotData(
                    lot_code=lot_code,
                    unit_cost=unit_cost,
                    production_date=production_date,
                    expiration_date=expiration_date,
                ),
            )
        )

        # 3. Registrar output con el lot_id del lote recién creado
        order.outputs = [
            ProductionOutput(
                item_id=order.item_id,
                lot_id=lot_id,
                quantity=produced_quantity,
                created_at=now,
                production_order_id=order.id,
            )
        ]
        await self._production_order_repository.add_outputs(order)

        # 4. Completar la orden
        order.complete(produced_quantity=produced_quantity, completed_at=now)
        await self._production_order_repository.save(order)
        return order
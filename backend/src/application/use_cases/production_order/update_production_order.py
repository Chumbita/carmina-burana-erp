# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO: ACTUALIZAR ORDEN DE PRODUCCIÓN PLANIFICADA
# ══════════════════════════════════════════════════════════════════════════════

from decimal import Decimal

from src.domain.entities.production_order import ProductionOrder
from src.domain.repositories.production_order_repository import IProductionOrderRepository
from src.domain.repositories.bom_repository import IBomRepository
from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.domain.repositories.inventory_lot_repository import IInventoryLotRepository
from src.domain.repositories.inventory_transaction_repository import IInventoryTransactionRepository
from src.domain.services.production_stock_service import ProductionStockService
from src.domain.value_objects.production_order_status import ProductionOrderStatus
from src.domain.exceptions.production_exceptions import (
    ProductionOrderNotFoundException,
    ProductionOrderCannotBeUpdatedException,
    BomNotFoundException,
)


class UpdateProductionOrderUseCase:
    """
    Actualiza los campos editables de una orden de producción en estado PLANNED:
    cantidad planificada y/o fecha programada.

    Mismas reglas de validación que la creación:
        - planned_quantity: obligatoria, debe ser > 0.
        - schedule_date: obligatoria, debe ser una fecha válida.

    FLUJO (si cambia la cantidad planificada):
        1. Obtener la orden y verificar que esté en PLANNED.
        2. Obtener la BOM detallada.
        3. Liberar las reservas tomadas por la cantidad anterior.
        4. Verificar stock suficiente para la nueva cantidad.
        5. Reservar stock por la nueva cantidad (FEFO).
        6. Persistir los cambios.
    """

    def __init__(
        self,
        production_order_repository: IProductionOrderRepository,
        bom_repository: IBomRepository,
        balance_repository: IInventoryBalanceRepository,
        lot_repository: IInventoryLotRepository,
        transaction_repository: IInventoryTransactionRepository,
    ) -> None:
        self._production_order_repository = production_order_repository
        self._bom_repository = bom_repository
        self._stock_service = ProductionStockService(
            balance_repository, lot_repository, transaction_repository
        )

    async def execute(
        self,
        order_id: int,
        planned_quantity: Decimal = None,
        schedule_date=None,
    ) -> ProductionOrder:

        # 1. Obtener la orden y verificar estado
        order = await self._production_order_repository.get_by_id(order_id)
        if order is None:
            raise ProductionOrderNotFoundException(order_id)

        if order.status != ProductionOrderStatus.PLANNED:
            raise ProductionOrderCannotBeUpdatedException(
                order_id, order.status.value
            )

        # 2. Validaciones (mismas que creación)
        if planned_quantity is not None:
            if planned_quantity <= 0:
                raise ValueError("La cantidad planificada debe ser mayor a 0")

        if schedule_date is None:
            raise ValueError("La fecha programada es requerida")

        new_quantity = (
            Decimal(str(planned_quantity)) if planned_quantity is not None else None
        )
        quantity_changed = (
            new_quantity is not None and new_quantity != order.planned_quantity
        )

        # 3-5. Ajuste de reservas si cambia la cantidad planificada
        if quantity_changed:
            bom = await self._bom_repository.get_detailed_bom_by_id(order.bom_id)
            if bom is None:
                raise BomNotFoundException(order.bom_id)

            await self._stock_service.release_reservations(
                bom=bom,
                order_id=order.id,
                planned_quantity=order.planned_quantity,
            )
            await self._stock_service.verify_stock(
                bom=bom,
                planned_quantity=new_quantity,
                order_id=order.id,
            )
            await self._stock_service.reserve_stock(
                bom=bom,
                planned_quantity=new_quantity,
            )
            order.planned_quantity = new_quantity

        # 6. Aplicar el resto de los cambios y persistir
        if schedule_date is not None:
            order.schedule_date = schedule_date

        return await self._production_order_repository.save(order)

# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO: CANCELAR ORDEN DE PRODUCCIÓN
# ══════════════════════════════════════════════════════════════════════════════

from decimal import Decimal

from src.domain.entities.production_order import ProductionOrder
from src.domain.entities.bom import Bom
from src.domain.entities.inventory_transaction import InventoryTransaction
from src.domain.repositories.production_order_repository import IProductionOrderRepository
from src.domain.repositories.bom_repository import IBomRepository
from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.domain.repositories.inventory_lot_repository import IInventoryLotRepository
from src.domain.repositories.inventory_transaction_repository import IInventoryTransactionRepository
from src.domain.value_objects.production_order_status import ProductionOrderStatus
from src.domain.value_objects.inventory_transaction_enums import TransactionType
from src.domain.services.audit_log_service import AuditLogService
from src.domain.exceptions.production_exceptions import (
    ProductionOrderNotFoundException,
    ProductionOrderCannotBeCancelledException,
    BomNotFoundException,
)


class CancelProductionOrderUseCase:
    """
    Cancela una orden de producción en estado PLANNED.
    Pasa a CANCELLED.

    FLUJO:
        1. Obtener la orden y verificar que esté en PLANNED.
        2. Obtener la BOM detallada para calcular las cantidades reservadas.
        3. Por cada línea de la BOM, liberar la reserva lote por lote (FEFO)
           y registrar un movimiento PRODUCTION_CANCEL por cada lote
           cuya reserva se libera.
        4. order.cancel() y persistir.
    """

    def __init__(
        self,
        production_order_repository: IProductionOrderRepository,
        bom_repository: IBomRepository,
        balance_repository: IInventoryBalanceRepository,
        lot_repository: IInventoryLotRepository,
        transaction_repository: IInventoryTransactionRepository,
        audit_log_service: AuditLogService | None = None,
    ) -> None:
        self._production_order_repository = production_order_repository
        self._bom_repository = bom_repository
        self._balance_repository = balance_repository
        self._lot_repository = lot_repository
        self._transaction_repository = transaction_repository
        self._audit_log_service = audit_log_service

    async def execute(self, order_id: int, user_id: int | None = None) -> ProductionOrder:

        # 1. Obtener la orden y verificar estado
        order = await self._production_order_repository.get_by_id(order_id)
        if order is None:
            raise ProductionOrderNotFoundException(order_id)

        if order.status != ProductionOrderStatus.PLANNED:
            raise ProductionOrderCannotBeCancelledException(
                order_id, order.status.value
            )

        # 2. Obtener la BOM (cabecera y líneas, suficiente para liberar reservas)
        bom = await self._bom_repository.get_by_id(order.bom_id)
        if bom is None:
            raise BomNotFoundException(order.bom_id)

        # 3. Liberar reservas y registrar movimientos PRODUCTION_CANCEL
        await self._release_reservations(order, bom)

        # 4. Cancelar la orden
        order.cancel()
        await self._production_order_repository.save(order)

        # 5. Registrar auditoría
        if self._audit_log_service is not None:
            await self._audit_log_service.log_production_order_cancelled(
                entity_id=order.id,
                old_data={"status": "PLANNED"},
                new_data={"status": order.status.value},
                user_id=user_id,
            )

        return order

    async def _release_reservations(self, order: ProductionOrder, bom: Bom) -> None:
        """
        Libera la reserva de cada insumo de la BOM en el orden FEFO,
        igual que lo hace la planificación. Registra una transacción
        PRODUCTION_CANCEL por cada lote cuya reserva se libera.
        """
        scale = order.planned_quantity / bom.quantity

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

                to_release = min(balance.reserved_quantity, remaining)
                if to_release <= Decimal("0"):
                    continue

                balance.release_reservation(to_release)
                await self._balance_repository.save(balance)

                await self._transaction_repository.add(
                    InventoryTransaction.record(
                        item_id=line.component_item_id,
                        lot_id=lot.id,
                        signed_quantity=to_release,
                        transaction_type=TransactionType.PRODUCTION_CANCEL.value,
                        reference_type="production_order",
                        reference_id=order.id,
                    )
                )

                remaining -= to_release

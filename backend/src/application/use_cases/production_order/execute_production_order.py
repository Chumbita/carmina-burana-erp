# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO FACADE: EJECUTAR ORDEN DE PRODUCCIÓN
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime, timezone
from decimal import Decimal

from src.domain.entities.production_order import ProductionConsumption, ProductionOutput
from src.domain.repositories.production_order_repository import IProductionOrderRepository
from src.domain.repositories.bom_repository import IBomRepository
from src.domain.repositories.inventory_lot_repository import IInventoryLotRepository
from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.application.dtos.inventory_movement_dtos import InventoryMovementCommand
from src.application.use_cases.inventory.inventory_movement_use_case import InventoryMovementUseCase
from src.application.dtos.inventory_lot_dtos import NewLotData
from src.domain.value_objects.inventory_transaction_enums import TransactionType
from src.domain.services.audit_log_service import AuditLogService
from src.domain.exceptions.production_exceptions import (
    ProductionOrderNotFoundException,
    BomNotFoundException,
)


class ExecuteProductionOrderUseCase:
    """
    Facade orquestador: Ejecutar una orden de producción.

    FLUJO (de PLANNED a DONE):
        1. Obtener la orden → verificar que esté en PLANNED.
        2. Obtener la BOM detallada.
        3. Consumir stock: seleccionar lotes FEFO, liberar reservas,
           ejecutar PRODUCTION_CONSUMITION, registrar consumos.
        4. Generar output: ejecutar PRODUCTION_OUTPUT, crear lote
           del producto terminado, registrar outputs.
        5. Marcar la orden como DONE.
        6. Persistir todo.
    """

    def __init__(
        self,
        production_order_repository: IProductionOrderRepository,
        bom_repository: IBomRepository,
        lot_repository: IInventoryLotRepository,
        balance_repository: IInventoryBalanceRepository,
        inventory_movement_use_case: InventoryMovementUseCase,
        audit_log_service: AuditLogService | None = None,
    ) -> None:
        self._production_order_repository = production_order_repository
        self._bom_repository = bom_repository
        self._lot_repository = lot_repository
        self._balance_repository = balance_repository
        self._inventory_movement = inventory_movement_use_case
        self._audit_log_service = audit_log_service

    async def execute(
        self,
        order_id: int,
        produced_quantity: Decimal,
        lot_code: str,
        unit_cost: Decimal,
        production_date=None,
        expiration_date=None,
        user_id: int | None = None,
    ):
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        # 1. Obtener la orden y verificar estado
        order = await self._production_order_repository.get_by_id(order_id)
        if order is None:
            raise ProductionOrderNotFoundException(order_id)

        if order.status.value != "PLANNED":
            raise ValueError(
                f"Cannot execute order in status '{order.status}'. "
                f"Expected PLANNED."
            )

        # 2. Obtener la BOM detallada
        bom = await self._bom_repository.get_detailed_bom_by_id(order.bom_id)
        if bom is None:
            raise BomNotFoundException(order.bom_id)

        # 3. Consumir stock (misma lógica que StartProductionOrderUseCase)
        scale = order.planned_quantity / bom["quantity"]
        consumptions = []
        missing = []

        for line in bom["lines"]:
            remaining = line["quantity"] * scale
            lots = await self._lot_repository.get_available_by_item_fefo(
                line["component_item_id"]
            )

            for lot in lots:
                if remaining <= Decimal("0"):
                    break

                balance = await self._balance_repository.get_by_lot(
                    line["component_item_id"], lot.id
                )
                if balance is None:
                    continue

                to_consume = min(balance.reserved_quantity, remaining)
                if to_consume <= Decimal("0"):
                    continue

                balance.release_reservation(to_consume)
                await self._balance_repository.save(balance)

                await self._inventory_movement.execute(
                    InventoryMovementCommand(
                        item_id=line["component_item_id"],
                        transaction_type=TransactionType.PRODUCTION_CONSUMITION,
                        quantity=to_consume,
                        reference_type="production_order",
                        reference_id=order.id,
                        lot_id=lot.id,
                    )
                )

                consumptions.append(
                    ProductionConsumption(
                        item_id=line["component_item_id"],
                        lot_id=lot.id,
                        quantity=to_consume,
                        created_at=now,
                        production_order_id=order.id,
                    )
                )

                remaining -= to_consume

            if remaining > Decimal("0"):
                missing.append({
                    "name": line["component_item_name"],
                    "required": line["quantity"] * scale,
                    "available": line["quantity"] * scale - remaining,
                    "uom_symbol": line["uom_symbol"],
                })

        if missing:
            from src.domain.exceptions.production_exceptions import InsufficientStockForProductionException
            raise InsufficientStockForProductionException(order_id, missing)

        # 4. Generar output (misma lógica que CompleteProductionOrderUseCase)
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

        outputs = [
            ProductionOutput(
                item_id=order.item_id,
                lot_id=lot_id,
                quantity=produced_quantity,
                created_at=now,
                production_order_id=order.id,
            )
        ]

        # 5. Marcar la orden como DONE
        order.complete(produced_quantity=produced_quantity, completed_at=now)

        # 6. Persistir todo
        order.consumptions = consumptions
        order.outputs = outputs
        await self._production_order_repository.add_consumptions(order)
        await self._production_order_repository.add_outputs(order)
        await self._production_order_repository.save(order)

        # 7. Registrar auditoría
        if self._audit_log_service is not None:
            await self._audit_log_service.log_production_order_completed(
                entity_id=order.id,
                old_data={"status": "PLANNED"},
                new_data={
                    "status": order.status.value,
                    "produced_quantity": float(order.produced_quantity),
                    "uom_symbol": bom["bom_uom_symbol"],
                    "lot_code": lot_code,
                },
                user_id=user_id,
            )

        return order

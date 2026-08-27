# ══════════════════════════════════════════════════════════════════════════════
# AJUSTE MANUAL DE CANTIDAD DE LOTE (AUDITORÍA)
# ══════════════════════════════════════════════════════════════════════════════

from decimal import Decimal
from datetime import datetime, timezone

from src.domain.entities.inventory_transaction import InventoryTransaction
from src.domain.entities.audit_log import AuditLog
from src.domain.value_objects.inventory_transaction_enums import TransactionType
from src.domain.exceptions.inventory_exceptions import LotNotFoundError, InventoryDomainError
from src.domain.exceptions.item_exceptions import ItemNotFoundException

from src.application.dtos.inventory.adjust_lot_dtos import AdjustLotCommand, AdjustLotResult


class AdjustLotQuantityUseCase:
    """
    Caso de uso: ajustar manualmente la cantidad de un lote tras auditoría.

    - Valida que el lote exista y pertenezca al item.
    - Valida que la nueva cantidad no sea negativa ni menor a lo reservado.
    - Calcula delta y aplica force_apply_delta (permite ajuste a la baja sin
      validar stock suficiente, como corresponde a INVENTORY_COUNT_ADJUSTMENT).
    - Registra InventoryTransaction INVENTORY_COUNT_ADJUSTMENT.
    - Registra AuditLog con motivo para trazabilidad.

    No hace commit: lo maneja get_db_session.
    """

    def __init__(
        self,
        lot_repository,
        balance_repository,
        transaction_repository,
        audit_log_repository,
        item_repository,
    ):
        self._lot_repo = lot_repository
        self._balance_repo = balance_repository
        self._txn_repo = transaction_repository
        self._audit_repo = audit_log_repository
        self._item_repo = item_repository

    async def execute(self, command: AdjustLotCommand) -> AdjustLotResult:
        reason = command.trimmed_reason
        if not reason:
            raise InventoryDomainError("El motivo del ajuste es obligatorio.")

        # 1. Validar lote e item
        lot = await self._lot_repo.get_by_id(command.lot_id)
        if lot is None:
            raise LotNotFoundError(command.lot_id)

        if lot.item_id != command.item_id:
            raise InventoryDomainError(
                f"El lote {command.lot_id} no pertenece al insumo {command.item_id}."
            )

        # Validar item existe y activo (opcional pero útil)
        item = await self._item_repo.get_by_id(command.item_id)
        if item is None:
            raise ItemNotFoundException(command.item_id)

        # 2. Obtener balance con lock
        balance = await self._balance_repo.get_by_lot(command.item_id, command.lot_id)
        if balance is None:
            raise InventoryDomainError(
                f"El lote {command.lot_id} no tiene balance asociado."
            )

        # Bloquear edición de agotados y vencidos (expiring_soon sí editable)
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        if balance.quantity <= Decimal("0"):
            raise InventoryDomainError("No se puede ajustar un lote agotado.")
        if lot.expiration_date is not None and lot.expiration_date < now:
            raise InventoryDomainError("No se puede ajustar un lote vencido.")

        current_qty = balance.quantity
        new_qty = command.new_quantity

        if new_qty == current_qty:
            raise InventoryDomainError("La nueva cantidad debe ser distinta a la actual.")

        if new_qty < balance.reserved_quantity:
            raise InventoryDomainError(
                f"No se puede ajustar por debajo de lo reservado "
                f"({balance.reserved_quantity} {item.base_uom_id if hasattr(item, 'base_uom_id') else ''}). "
                f"Nueva cantidad: {new_qty}."
            )

        delta = new_qty - current_qty

        if delta == Decimal("0"):
            raise InventoryDomainError("El ajuste no genera movimiento.")

        # 3. Aplicar delta al balance
        # INVENTORY_COUNT_ADJUSTMENT permite delta positivo o negativo
        balance.force_apply_delta(delta)
        # Validar invariante post-ajuste (no puede quedar negativo ni reserved > quantity)
        # force_apply_delta no valida, así que validamos manualmente que no quede negativo
        # y que reserved no supere quantity (ya validado arriba)
        if balance.quantity < Decimal("0"):
            raise InventoryDomainError("La cantidad resultante no puede ser negativa.")
        # Re-validar reserved invariant (por si el delta negativo dejó reserved > quantity)
        if balance.reserved_quantity > balance.quantity:
            raise InventoryDomainError(
                f"La cantidad resultante ({balance.quantity}) no puede ser menor a lo reservado ({balance.reserved_quantity})."
            )

        await self._balance_repo.save(balance)

        # 4. Registrar transacción inmutable con motivo per-record
        # reference_id debe ser >0: usamos lot_id
        transaction = InventoryTransaction.record(
            item_id=command.item_id,
            lot_id=command.lot_id,
            signed_quantity=delta,
            transaction_type=TransactionType.INVENTORY_COUNT_ADJUSTMENT.value,
            reference_type="inventory_adjustment",
            reference_id=command.lot_id,
            reason=reason,
        )
        await self._txn_repo.add(transaction)

        # 5. Auditoría con motivo — entity_type supply para que aparezca en ficha del insumo
        audit = AuditLog(
            id=0,
            entity_type="supply",
            entity_id=command.item_id,
            action="UPDATED",
            old_data={
                "item_id": command.item_id,
                "lot_id": command.lot_id,
                "lot_code": lot.lot_code,
                "previous_quantity": str(current_qty),
                "new_quantity": str(new_qty),
                "delta": str(delta),
                "reason": reason,
            },
            new_data={
                "quantity": str(new_qty),
                "lot_code": lot.lot_code,
                "reason": reason,
            },
            created_at=datetime.now(timezone.utc),
            user_id=command.user_id,
        )
        await self._audit_repo.add(audit)

        return AdjustLotResult(
            item_id=command.item_id,
            lot_id=command.lot_id,
            previous_quantity=current_qty,
            new_quantity=new_qty,
            delta=delta,
            reserved_quantity=balance.reserved_quantity,
        )

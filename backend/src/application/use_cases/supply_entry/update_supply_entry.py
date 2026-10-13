from datetime import datetime, timezone
from decimal import Decimal

from src.application.dtos.supply_entry.supply_entry_commands_dtos import (
    UpdateSupplyEntryCommand,
    UpdateSupplyEntryLineCommand,
)
from src.application.dtos.supply_entry.supply_entry_responses_dtos import (
    SupplyEntryDetailResponse,
    SupplyEntryDetailLineResponse,
    SupplierRef,
    ItemRef,
)
from src.domain.entities.inventory_lot import InventoryLot
from src.domain.entities.inventory_balance import InventoryBalance
from src.domain.entities.inventory_transaction import InventoryTransaction
from src.domain.repositories.supply_entry_repository import ISupplyEntryRepository
from src.domain.repositories.item_repository import IItemRepostory
from src.domain.repositories.inventory_lot_repository import IInventoryLotRepository
from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.domain.repositories.inventory_transaction_repository import IInventoryTransactionRepository
from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.domain.exceptions.inventory_exceptions import DuplicateLotCodeError
from src.domain.exceptions.supply_entry_exceptions import (
    SupplyEntryNotFound,
    SupplyEntryAlreadyCancelled,
    SupplyEntryItemsConsumed,
)
from src.domain.value_objects.supply_entry_status import SupplyEntryStatus
from src.domain.value_objects.inventory_transaction_enums import TransactionType


class UpdateSupplyEntryUseCase:
    def __init__(
        self,
        supply_entry_repo: ISupplyEntryRepository,
        item_repo: IItemRepostory,
        lot_repo: IInventoryLotRepository,
        balance_repo: IInventoryBalanceRepository,
        txn_repo: IInventoryTransactionRepository,
    ) -> None:
        self._supply_entry_repo = supply_entry_repo
        self._item_repo = item_repo
        self._lot_repo = lot_repo
        self._balance_repo = balance_repo
        self._txn_repo = txn_repo

    @staticmethod
    def _naive(dt: datetime | None) -> datetime | None:
        if dt is not None and dt.tzinfo is not None:
            return dt.replace(tzinfo=None)
        return dt

    async def execute(self, command: UpdateSupplyEntryCommand) -> SupplyEntryDetailResponse:
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        raw = await self._supply_entry_repo.find_by_id(command.entry_id)
        if raw is None:
            raise SupplyEntryNotFound(command.entry_id)
        if raw.status == SupplyEntryStatus.CANCELED.value:
            raise SupplyEntryAlreadyCancelled(command.entry_id)

        # Bloqueo total si algún lote ya fue consumido (balance < cantidad original)
        await self._validate_not_consumed(raw)

        # Actualizar cabecera si viene alguno de esos campos
        await self._update_header(raw, command, now)

        # Si vienen líneas, hacer reemplazo completo (edición completa)
        if command.lines is not None:
            await self._sync_lines(raw, command.lines, now)

        updated = await self._supply_entry_repo.find_by_id(command.entry_id)
        return self._build_response(updated)

    async def _validate_not_consumed(self, raw) -> None:
        consumed: list[str] = []
        for line in raw.lines:
            if not line.lot_code:
                continue
            lot = await self._lot_repo.find_by_item_and_code(line.item_id, line.lot_code)
            if lot is None or lot.id is None:
                continue
            balance = await self._balance_repo.get_by_lot(line.item_id, lot.id)
            if balance is None:
                continue
            if balance.quantity < line.quantity:
                consumed.append(line.lot_code)
        if consumed:
            raise SupplyEntryItemsConsumed(raw.id, consumed)

    async def _update_header(self, raw, command: UpdateSupplyEntryCommand, now: datetime) -> None:
        has_header_change = any(
            v is not None
            for v in [
                command.supplier_id,
                command.document_number,
                command.entry_date,
                command.description,
            ]
        )
        if not has_header_change:
            return

        # Usar entidad para validar guardias
        from src.domain.entities.supply_entry import SupplyEntryOrder

        order = SupplyEntryOrder(
            id=raw.id,
            supplier_id=raw.supplier_id,
            document_number=raw.document_number,
            entry_date=raw.entry_date,
            description=raw.description,
            status=SupplyEntryStatus(raw.status),
            created_at=raw.created_at,
            canceled_at=raw.canceled_at,
        )
        order.update_header(
            supplier_id=command.supplier_id,
            document_number=command.document_number,
            entry_date=self._naive(command.entry_date) if command.entry_date else None,
            description=command.description,
        )
        await self._supply_entry_repo.update_order(order)

    async def _sync_lines(
        self,
        raw,
        incoming: list[UpdateSupplyEntryLineCommand],
        now: datetime,
    ) -> None:
        # Mapa de líneas existentes por line_id (que viene como lot_id en DetailData)
        existing_by_id: dict[int, object] = {}
        for line in raw.lines:
            # lot_id en DetailData es en realidad supply_entry_line.id (bug histórico)
            line_id = line.lot_id
            if line_id is not None:
                existing_by_id[line_id] = line

        incoming_by_id: dict[int, UpdateSupplyEntryLineCommand] = {}
        new_lines: list[UpdateSupplyEntryLineCommand] = []
        for inc in incoming:
            if inc.line_id is not None and inc.line_id in existing_by_id:
                incoming_by_id[inc.line_id] = inc
            else:
                # Si trae line_id que no existe, tratar como nueva
                if inc.line_id is not None and inc.line_id not in existing_by_id:
                    new_lines.append(inc)
                elif inc.line_id is None:
                    new_lines.append(inc)
                else:
                    incoming_by_id[inc.line_id] = inc

        # Líneas a eliminar: existentes que no están en incoming
        to_delete = [lid for lid in existing_by_id.keys() if lid not in incoming_by_id]

        # Validar que no se eliminen líneas consumidas (ya validado arriba que ninguna consumida, pero por si acaso)
        # Validar reserva para líneas que reducen cantidad
        for line_id, inc in incoming_by_id.items():
            old = existing_by_id[line_id]
            # Si cambia de insumo, lo tratamos como delete+create, no hay check de reserva sobre old con new
            if inc.item_id != old.item_id:
                # Verificar que la línea vieja no tenga reserva que impida borrar
                await self._ensure_can_remove(old)
                continue
            # Mismo insumo: verificar reserva si reduce cantidad
            if inc.quantity < old.quantity:
                lot = await self._lot_repo.find_by_item_and_code(old.item_id, old.lot_code)
                if lot and lot.id:
                    bal = await self._balance_repo.get_by_lot(old.item_id, lot.id)
                    if bal and inc.quantity < bal.reserved_quantity:
                        raise SupplyEntryItemsConsumed(
                            raw.id, [old.lot_code or f"line:{line_id}"]
                        )

        # Para líneas a eliminar, verificar reserva
        for line_id in to_delete:
            old = existing_by_id[line_id]
            await self._ensure_can_remove(old)

        # 1. Eliminar líneas que no vienen
        for line_id in to_delete:
            old = existing_by_id[line_id]
            await self._delete_existing_line(old, raw.id, now)

        # 2. Actualizar líneas existentes
        for line_id, inc in incoming_by_id.items():
            old = existing_by_id[line_id]
            if inc.item_id != old.item_id:
                # Cambio de insumo: borrar vieja y crear nueva
                await self._delete_existing_line(old, raw.id, now)
                await self._validate_item(inc.item_id)
                await self._create_new_line(inc, raw.id, now)
            else:
                await self._update_existing_line(old, inc, raw.id, now)

        # 3. Crear líneas nuevas
        for inc in new_lines:
            await self._validate_item(inc.item_id)
            await self._create_new_line(inc, raw.id, now)

    async def _ensure_can_remove(self, old) -> None:
        if not old.lot_code:
            return
        lot = await self._lot_repo.find_by_item_and_code(old.item_id, old.lot_code)
        if lot is None or lot.id is None:
            return
        bal = await self._balance_repo.get_by_lot(old.item_id, lot.id)
        if bal is None:
            return
        # Si tiene reserva, no se puede eliminar (quedaría < reservado)
        if bal.reserved_quantity > 0:
            raise SupplyEntryItemsConsumed(old.item_id, [old.lot_code])

    async def _delete_existing_line(self, old, order_id: int, now: datetime) -> None:
        if not old.lot_code:
            # Sin lote, solo borrar línea
            await self._supply_entry_repo.delete_line(old.lot_id)
            return
        lot = await self._lot_repo.find_by_item_and_code(old.item_id, old.lot_code)
        if lot is None or lot.id is None:
            await self._supply_entry_repo.delete_line(old.lot_id)
            return
        # Revertir inventario: balance a 0
        bal = await self._balance_repo.get_by_lot(old.item_id, lot.id)
        if bal is not None:
            # Transacción de reversa total de la cantidad original
            txn = InventoryTransaction.record(
                item_id=old.item_id,
                lot_id=lot.id,
                signed_quantity=-old.quantity,
                transaction_type=TransactionType.RETURN_PURCHASE.value,
                reference_type="supply_entry",
                reference_id=order_id,
            )
            await self._txn_repo.add(txn)
            bal.apply_delta(-old.quantity)
            await self._balance_repo.save(bal)
        await self._supply_entry_repo.delete_line(old.lot_id)

    async def _update_existing_line(self, old, inc: UpdateSupplyEntryLineCommand, order_id: int, now: datetime) -> None:
        # Normalizar lot_code entrante
        new_lot_code = inc.lot_code.strip().upper() if inc.lot_code else None
        old_lot_code = old.lot_code

        # Si lot_code cambia, validar duplicado y actualizar lote
        lot = await self._lot_repo.find_by_item_and_code(old.item_id, old_lot_code) if old_lot_code else None

        # Delta de cantidad
        delta = inc.quantity - old.quantity

        if delta != 0 and lot and lot.id:
            bal = await self._balance_repo.get_by_lot(old.item_id, lot.id)
            if bal:
                # Ya validado que no está consumido y que new >= reserved
                txn_type = TransactionType.PURCHASE.value if delta > 0 else TransactionType.RETURN_PURCHASE.value
                txn = InventoryTransaction.record(
                    item_id=old.item_id,
                    lot_id=lot.id,
                    signed_quantity=delta,
                    transaction_type=txn_type,
                    reference_type="supply_entry",
                    reference_id=order_id,
                )
                await self._txn_repo.add(txn)
                bal.apply_delta(delta)
                await self._balance_repo.save(bal)

        # Actualizar lote: costo, vencimiento, lot_code
        if lot:
            needs_lot_save = False
            if inc.unit_cost != old.unit_cost:
                lot.unit_cost = inc.unit_cost
                needs_lot_save = True
            new_exp = self._naive(inc.expiration_date)
            if new_exp != lot.expiration_date:
                lot.expiration_date = new_exp
                needs_lot_save = True
            if new_lot_code and new_lot_code != old_lot_code:
                if await self._lot_repo.exists_by_code(inc.item_id, new_lot_code):
                    raise DuplicateLotCodeError(inc.item_id, new_lot_code)
                lot.lot_code = new_lot_code
                needs_lot_save = True
            if needs_lot_save:
                await self._lot_repo.save(lot)

        # Actualizar línea de supply_entry
        from src.domain.entities.supply_entry import SupplyEntryLine

        # Necesitamos el ID real de la línea (lot_id en DetailData)
        line_entity = SupplyEntryLine(
            id=old.lot_id,
            item_id=inc.item_id,
            quantity=inc.quantity,
            unit_cost=inc.unit_cost,
            expiration_date=self._naive(inc.expiration_date),
            lot_code=new_lot_code if new_lot_code is not None else old_lot_code,
            comment=inc.comment,
        )
        # Omitir validación de fecha pasada si es la misma que tenía
        await self._supply_entry_repo.update_line(line_entity)

    async def _create_new_line(self, inc: UpdateSupplyEntryLineCommand, order_id: int, now: datetime) -> None:
        await self._validate_item(inc.item_id)
        lot_code = inc.lot_code.strip().upper() if inc.lot_code else None
        if lot_code:
            if await self._lot_repo.exists_by_code(inc.item_id, lot_code):
                raise DuplicateLotCodeError(inc.item_id, lot_code)
        else:
            lot_code = self._build_lot_code(order_id, inc.item_id, now)

        exp = self._naive(inc.expiration_date)
        lot = InventoryLot.create(
            item_id=inc.item_id,
            lot_code=lot_code,
            unit_cost=inc.unit_cost,
            expiration_date=exp,
        )
        lot = await self._lot_repo.save(lot)

        balance = InventoryBalance.initialize(
            item_id=inc.item_id,
            lot_id=lot.id,
            initial_quantity=inc.quantity,
        )
        await self._balance_repo.save(balance)

        txn = InventoryTransaction.record(
            item_id=inc.item_id,
            lot_id=lot.id,
            signed_quantity=inc.quantity,
            transaction_type=TransactionType.PURCHASE.value,
            reference_type="supply_entry",
            reference_id=order_id,
        )
        await self._txn_repo.add(txn)

        from src.domain.entities.supply_entry import SupplyEntryLine

        entry_line = SupplyEntryLine(
            item_id=inc.item_id,
            quantity=inc.quantity,
            unit_cost=inc.unit_cost,
            expiration_date=exp,
            comment=inc.comment,
        )
        entry_line.assign_lot(lot_code)
        await self._supply_entry_repo.add_line(entry_line, order_id)

    async def _validate_item(self, item_id: int) -> None:
        item = await self._item_repo.get_by_id(item_id)
        if item is None:
            raise ItemNotFoundException(item_id)

    @staticmethod
    def _build_lot_code(order_id: int, item_id: int, now: datetime) -> str:
        return f"LOT-{now.strftime('%Y%m%d')}-{order_id}-{item_id}"

    @staticmethod
    def _build_response(raw) -> SupplyEntryDetailResponse:
        supplier = None
        if raw.supplier_id is not None and raw.supplier_name is not None:
            supplier = SupplierRef(
                id=raw.supplier_id,
                name=raw.supplier_name,
                phone=raw.supplier_phone,
            )
        lines = [
            SupplyEntryDetailLineResponse(
                item=ItemRef(
                    id=line.item_id,
                    name=line.item_name,
                    brand_name=line.brand_name,
                ),
                quantity=line.quantity,
                unit_cost=line.unit_cost,
                expiration_date=line.expiration_date,
                lot_code=line.lot_code,
                lot_id=line.lot_id,
                comment=line.comment,
            )
            for line in raw.lines
        ]
        return SupplyEntryDetailResponse(
            id=raw.id,
            document_number=raw.document_number,
            supplier=supplier,
            entry_date=raw.entry_date,
            description=raw.description,
            cancellation_reason=raw.cancellation_reason,
            status=SupplyEntryStatus(raw.status),
            created_at=raw.created_at,
            canceled_at=raw.canceled_at,
            lines=lines,
        )

from datetime import datetime, timezone

from src.application.dtos.supply_entry.supply_entry_commands_dtos import CancelSupplyEntryCommand
from src.application.dtos.supply_entry.supply_entry_responses_dtos import (
    SupplyEntryDetailResponse,
    SupplyEntryDetailLineResponse,
    SupplierRef,
    ItemRef,
)
from src.domain.entities.inventory_transaction import InventoryTransaction
from src.domain.repositories.supply_entry_repository import (
    ISupplyEntryRepository,
    SupplyEntryDetailData,
)
from src.domain.repositories.inventory_lot_repository import IInventoryLotRepository
from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.domain.repositories.inventory_transaction_repository import IInventoryTransactionRepository
from src.domain.exceptions.supply_entry_exceptions import (
    SupplyEntryNotFound,
    SupplyEntryAlreadyCancelled,
    SupplyEntryTimeWindowExceeded,
    SupplyEntryItemsConsumed,
)
from src.domain.value_objects.supply_entry_status import SupplyEntryStatus
from src.domain.value_objects.inventory_transaction_enums import TransactionType


class CancelSupplyEntryUseCase:

    def __init__(
        self,
        supply_entry_repo: ISupplyEntryRepository,
        lot_repo: IInventoryLotRepository,
        balance_repo: IInventoryBalanceRepository,
        txn_repo: IInventoryTransactionRepository,
    ) -> None:
        self._supply_entry_repo = supply_entry_repo
        self._lot_repo = lot_repo
        self._balance_repo = balance_repo
        self._txn_repo = txn_repo

    async def execute(self, command: CancelSupplyEntryCommand) -> SupplyEntryDetailResponse:
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        raw = await self._supply_entry_repo.find_by_id(command.entry_id)
        if raw is None:
            raise SupplyEntryNotFound(command.entry_id)
        if raw.status == SupplyEntryStatus.CANCELED.value:
            raise SupplyEntryAlreadyCancelled(command.entry_id)

        self._validate_time_window(raw, now)
        await self._validate_lots_integrity(raw)

        await self._reverse_inventory(raw, now)
        await self._supply_entry_repo.set_cancelled(
            command.entry_id, now, command.reason
        )

        updated = await self._supply_entry_repo.find_by_id(command.entry_id)
        return self._build_response(updated)

    # ── Validaciones ────────────────────────────────────────────────

    @staticmethod
    def _validate_time_window(raw: SupplyEntryDetailData, now: datetime) -> None:
        delta = now - raw.entry_date
        if delta.total_seconds() > 48 * 3600:
            raise SupplyEntryTimeWindowExceeded(raw.id, raw.entry_date)

    async def _validate_lots_integrity(self, raw: SupplyEntryDetailData) -> None:
        consumed_lots: list[str] = []
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
                consumed_lots.append(line.lot_code)

        if consumed_lots:
            raise SupplyEntryItemsConsumed(raw.id, consumed_lots)

    # ── Reversión de inventario ─────────────────────────────────────

    async def _reverse_inventory(
        self, raw: SupplyEntryDetailData, now: datetime
    ) -> None:
        for line in raw.lines:
            if not line.lot_code:
                continue
            lot = await self._lot_repo.find_by_item_and_code(line.item_id, line.lot_code)
            if lot is None or lot.id is None:
                continue

            txn = InventoryTransaction.record(
                item_id=line.item_id,
                lot_id=lot.id,
                signed_quantity=-line.quantity,
                transaction_type=TransactionType.RETURN_PURCHASE.value,
                reference_type="supply_entry",
                reference_id=raw.id,
            )
            await self._txn_repo.add(txn)

            balance = await self._balance_repo.get_by_lot(line.item_id, lot.id)
            if balance is not None:
                balance.apply_delta(-line.quantity)
                await self._balance_repo.save(balance)

    # ── Construcción de respuesta ───────────────────────────────────

    @staticmethod
    def _build_response(raw: SupplyEntryDetailData) -> SupplyEntryDetailResponse:
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
            status=SupplyEntryStatus(raw.status),
            created_at=raw.created_at,
            canceled_at=raw.canceled_at,
            lines=lines,
        )

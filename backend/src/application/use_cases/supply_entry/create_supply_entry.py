from datetime import datetime, timezone
from decimal import Decimal

from src.application.dtos.supply_entry.supply_entry_commands_dtos import (
    CreateSupplyEntryCommand,
    SupplyEntryLineCommand,
)
from src.application.dtos.supply_entry.supply_entry_responses_dtos import (
    SupplyEntryResponse,
    SupplyEntryLineResponse,
)
from src.domain.entities.supply_entry import SupplyEntryOrder, SupplyEntryLine
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
from src.domain.value_objects.supply_entry_status import SupplyEntryStatus
from src.domain.value_objects.inventory_transaction_enums import TransactionType


class CreateSupplyEntryUseCase:

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

    async def execute(self, command: CreateSupplyEntryCommand) -> SupplyEntryResponse:
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        document_number = command.document_number or f"RCP-{now.strftime('%Y%m%d%H%M%S')}"

        entry_date = self._naive(command.entry_date)

        order = SupplyEntryOrder(
            supplier_id=command.supplier_id,
            document_number=document_number,
            entry_date=entry_date or now,
            description=command.description,
            status=SupplyEntryStatus.CONFIRMED,
            created_at=now,
        )

        order = await self._supply_entry_repo.add_order(order)

        lines_response = []
        for line in command.lines:
            line_response = await self._process_line(line, order.id, now)
            lines_response.append(line_response)

        return SupplyEntryResponse(
            id=order.id,
            document_number=order.document_number,
            supplier_id=order.supplier_id,
            entry_date=order.entry_date,
            description=order.description,
            status=order.status,
            created_at=order.created_at,
            lines=lines_response,
        )

    # ── Procesamiento de línea ─────────────────────────────────────

    async def _process_line(
        self, line: SupplyEntryLineCommand, order_id: int, now: datetime
    ) -> SupplyEntryLineResponse:
        await self._validate_item(line.item_id)

        if line.lot_code:
            if await self._lot_repo.exists_by_code(line.item_id, line.lot_code):
                raise DuplicateLotCodeError(line.item_id, line.lot_code)
            lot_code = line.lot_code.strip().upper()
        else:
            lot_code = self._build_lot_code(order_id, line.item_id, now)

        line.expiration_date = self._naive(line.expiration_date)
        lot = await self._create_lot(line, lot_code)
        await self._create_balance(line, lot.id)
        await self._create_transaction(line, lot.id, order_id)
        await self._create_entry_line(line, lot_code, order_id)

        return self._build_line_response(line, lot_code, lot.id)

    # ── Validaciones ───────────────────────────────────────────────

    async def _validate_item(self, item_id: int) -> None:
        item = await self._item_repo.get_by_id(item_id)
        if item is None:
            raise ItemNotFoundException(item_id)

    # ── Helpers de construcción ────────────────────────────────────

    @staticmethod
    def _build_lot_code(order_id: int, item_id: int, now: datetime) -> str:
        return f"LOT-{now.strftime('%Y%m%d')}-{order_id}-{item_id}"

    # ── Creación de inventario ─────────────────────────────────────

    async def _create_lot(
        self, line: SupplyEntryLineCommand, lot_code: str
    ) -> InventoryLot:
        lot = InventoryLot.create(
            item_id=line.item_id,
            lot_code=lot_code,
            unit_cost=line.unit_cost,
            expiration_date=line.expiration_date,
        )
        return await self._lot_repo.save(lot)

    async def _create_balance(
        self, line: SupplyEntryLineCommand, lot_id: int
    ) -> None:
        balance = InventoryBalance.initialize(
            item_id=line.item_id,
            lot_id=lot_id,
            initial_quantity=line.quantity,
        )
        await self._balance_repo.save(balance)

    async def _create_transaction(
        self, line: SupplyEntryLineCommand, lot_id: int, order_id: int
    ) -> None:
        txn = InventoryTransaction.record(
            item_id=line.item_id,
            lot_id=lot_id,
            signed_quantity=line.quantity,
            transaction_type=TransactionType.PURCHASE.value,
            reference_type="supply_entry",
            reference_id=order_id,
        )
        await self._txn_repo.add(txn)

    # ── Persistencia de línea ──────────────────────────────────────

    async def _create_entry_line(
        self, line: SupplyEntryLineCommand, lot_code: str, order_id: int
    ) -> None:
        entry_line = SupplyEntryLine(
            item_id=line.item_id,
            quantity=line.quantity,
            unit_cost=line.unit_cost,
            expiration_date=line.expiration_date,
            comment=line.comment,
        )
        entry_line.assign_lot(lot_code)
        await self._supply_entry_repo.add_line(entry_line, order_id)

    # ── Construcción de respuesta ──────────────────────────────────

    @staticmethod
    def _build_line_response(
        line: SupplyEntryLineCommand, lot_code: str, lot_id: int
    ) -> SupplyEntryLineResponse:
        return SupplyEntryLineResponse(
            item_id=line.item_id,
            quantity=line.quantity,
            unit_cost=line.unit_cost,
            expiration_date=line.expiration_date,
            lot_code=lot_code,
            lot_id=lot_id,
            comment=line.comment,
        )

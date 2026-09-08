import pytest
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from types import SimpleNamespace

from src.application.use_cases.supply_entry.update_supply_entry import UpdateSupplyEntryUseCase
from src.application.dtos.supply_entry.supply_entry_commands_dtos import (
    UpdateSupplyEntryCommand,
    UpdateSupplyEntryLineCommand,
)
from src.domain.repositories.supply_entry_repository import (
    SupplyEntryDetailData,
    SupplyEntryLineDetailData,
)
from src.domain.entities.inventory_lot import InventoryLot
from src.domain.entities.inventory_balance import InventoryBalance
from src.domain.exceptions.supply_entry_exceptions import (
    SupplyEntryNotFound,
    SupplyEntryAlreadyCancelled,
    SupplyEntryItemsConsumed,
)
from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.domain.exceptions.inventory_exceptions import DuplicateLotCodeError
from src.domain.value_objects.supply_entry_status import SupplyEntryStatus


def _future(days=30):
    return (datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=days)).replace(microsecond=0)


def _past(days=1):
    return (datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=days)).replace(microsecond=0)


# ── Fakes ──────────────────────────────────────────────────────────


class FakeSupplyEntryRepo:
    def __init__(self, entries: dict[int, SupplyEntryDetailData]):
        self.entries = entries
        self.updated_orders = []
        self.updated_lines = []
        self.deleted_lines = []
        self.added_lines = []
        self._next_line_id = 9000

    async def find_by_id(self, entry_id: int):
        return self.entries.get(entry_id)

    async def update_order(self, order):
        self.updated_orders.append(order)
        raw = self.entries.get(order.id)
        if raw:
            raw.supplier_id = order.supplier_id
            raw.document_number = order.document_number
            raw.entry_date = order.entry_date
            raw.description = order.description

    async def update_line(self, line):
        self.updated_lines.append(line)
        # find line in entries by line.id
        for entry in self.entries.values():
            for idx, l in enumerate(entry.lines):
                if l.lot_id == line.id:
                    # update fields
                    entry.lines[idx].item_id = line.item_id
                    entry.lines[idx].quantity = line.quantity
                    entry.lines[idx].unit_cost = line.unit_cost
                    entry.lines[idx].expiration_date = line.expiration_date
                    entry.lines[idx].lot_code = line.lot_code
                    entry.lines[idx].comment = line.comment
                    return

    async def delete_line(self, line_id: int):
        self.deleted_lines.append(line_id)
        for entry in self.entries.values():
            entry.lines = [l for l in entry.lines if l.lot_id != line_id]

    async def add_line(self, line, supply_entry_id: int):
        self.added_lines.append((line, supply_entry_id))
        entry = self.entries.get(supply_entry_id)
        if entry is not None:
            self._next_line_id += 1
            entry.lines.append(
                SupplyEntryLineDetailData(
                    item_id=line.item_id,
                    item_name=f"Item {line.item_id}",
                    quantity=line.quantity,
                    unit_cost=line.unit_cost,
                    expiration_date=line.expiration_date,
                    lot_code=line.lot_code,
                    lot_id=self._next_line_id,
                    comment=line.comment,
                )
            )

    async def set_cancelled(self, *a, **kw):
        pass


class FakeItemRepo:
    def __init__(self, available_ids=None):
        self.available_ids = set(available_ids) if available_ids is not None else {1, 2, 3, 4, 5, 9}

    async def get_by_id(self, item_id: int):
        if item_id in self.available_ids:
            return SimpleNamespace(id=item_id)
        return None


class FakeLotRepo:
    def __init__(self, lots: dict[tuple[int, str], InventoryLot] = None):
        # key (item_id, lot_code)
        self.lots: dict[tuple[int, str], InventoryLot] = dict(lots or {})
        self._next_id = 1000

    async def find_by_item_and_code(self, item_id: int, lot_code: str):
        return self.lots.get((item_id, lot_code))

    async def exists_by_code(self, item_id: int, lot_code: str):
        return (item_id, lot_code) in self.lots

    async def save(self, lot: InventoryLot):
        if lot.id is None:
            self._next_id += 1
            lot.id = self._next_id
            self.lots[(lot.item_id, lot.lot_code)] = lot
        else:
            # update: find old key if lot_code changed
            # remove old entry if code changed
            keys_to_delete = [k for k, v in self.lots.items() if v.id == lot.id and k != (lot.item_id, lot.lot_code)]
            for k in keys_to_delete:
                del self.lots[k]
            self.lots[(lot.item_id, lot.lot_code)] = lot
        return lot


class FakeBalanceRepo:
    def __init__(self, balances: dict[tuple[int, int], InventoryBalance] = None):
        self.balances: dict[tuple[int, int], InventoryBalance] = dict(balances or {})

    async def get_by_lot(self, item_id: int, lot_id: int):
        return self.balances.get((item_id, lot_id))

    async def save(self, balance: InventoryBalance):
        self.balances[(balance.item_id, balance.lot_id)] = balance


class FakeTxnRepo:
    def __init__(self):
        self.added = []

    async def add(self, txn):
        self.added.append(txn)


def _make_raw(entry_id=1, status=SupplyEntryStatus.CONFIRMED.value, lines=None):
    if lines is None:
        lines = [
            SupplyEntryLineDetailData(
                item_id=1,
                item_name="Item 1",
                quantity=Decimal("10"),
                unit_cost=Decimal("5"),
                expiration_date=_future(60),
                lot_code="LOT-A",
                lot_id=101,
                comment=None,
            )
        ]
    return SupplyEntryDetailData(
        id=entry_id,
        document_number="DOC-1",
        supplier_id=1,
        supplier_name="Sup 1",
        entry_date=datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=1),
        description="desc",
        status=status,
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        lines=lines,
    )


def _make_lot(item_id, lot_code, unit_cost=Decimal("5"), expiration=None, lot_id=50):
    return InventoryLot(
        id=lot_id,
        item_id=item_id,
        lot_code=lot_code,
        unit_cost=unit_cost,
        expiration_date=expiration or _future(60),
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )


def _make_balance(item_id, lot_id, quantity, reserved="0"):
    return InventoryBalance(
        item_id=item_id,
        lot_id=lot_id,
        quantity=Decimal(quantity),
        reserved_quantity=Decimal(reserved),
        updated_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )


# ── Tests ──────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_update_only_header_no_lines():
    raw = _make_raw()
    entry_repo = FakeSupplyEntryRepo({1: raw})
    lot = _make_lot(1, "LOT-A", lot_id=50)
    fake_lot = FakeLotRepo({(1, "LOT-A"): lot})
    fake_bal = FakeBalanceRepo({(1, 50): _make_balance(1, 50, "10")})
    fake_txn = FakeTxnRepo()

    use_case = UpdateSupplyEntryUseCase(entry_repo, FakeItemRepo(), fake_lot, fake_bal, fake_txn)
    cmd = UpdateSupplyEntryCommand(entry_id=1, description="nueva desc", document_number="DOC-NEW", lines=None)
    result = await use_case.execute(cmd)

    assert raw.description == "nueva desc"
    assert raw.document_number == "DOC-NEW"
    assert len(fake_txn.added) == 0
    assert len(entry_repo.updated_lines) == 0
    assert result.document_number == "DOC-NEW"


@pytest.mark.asyncio
async def test_update_increase_quantity():
    raw = _make_raw()
    entry_repo = FakeSupplyEntryRepo({1: raw})
    lot = _make_lot(1, "LOT-A", lot_id=50)
    fake_lot = FakeLotRepo({(1, "LOT-A"): lot})
    fake_bal = FakeBalanceRepo({(1, 50): _make_balance(1, 50, "10")})
    fake_txn = FakeTxnRepo()

    use_case = UpdateSupplyEntryUseCase(entry_repo, FakeItemRepo(), fake_lot, fake_bal, fake_txn)
    cmd = UpdateSupplyEntryCommand(
        entry_id=1,
        lines=[
            UpdateSupplyEntryLineCommand(line_id=101, item_id=1, quantity=Decimal("15"), unit_cost=Decimal("5"), expiration_date=_future(60), lot_code="LOT-A")
        ],
    )
    await use_case.execute(cmd)

    assert len(fake_txn.added) == 1
    assert fake_txn.added[0].quantity == Decimal("5")
    assert fake_txn.added[0].transaction_type == "PURCHASE"
    assert fake_bal.balances[(1, 50)].quantity == Decimal("15")


@pytest.mark.asyncio
async def test_update_decrease_quantity():
    raw = _make_raw()
    entry_repo = FakeSupplyEntryRepo({1: raw})
    lot = _make_lot(1, "LOT-A", lot_id=50)
    fake_lot = FakeLotRepo({(1, "LOT-A"): lot})
    fake_bal = FakeBalanceRepo({(1, 50): _make_balance(1, 50, "10")})
    fake_txn = FakeTxnRepo()

    use_case = UpdateSupplyEntryUseCase(entry_repo, FakeItemRepo(), fake_lot, fake_bal, fake_txn)
    cmd = UpdateSupplyEntryCommand(
        entry_id=1,
        lines=[
            UpdateSupplyEntryLineCommand(line_id=101, item_id=1, quantity=Decimal("6"), unit_cost=Decimal("5"), expiration_date=_future(60), lot_code="LOT-A")
        ],
    )
    await use_case.execute(cmd)

    assert len(fake_txn.added) == 1
    assert fake_txn.added[0].quantity == Decimal("-4")
    assert fake_txn.added[0].transaction_type == "RETURN_PURCHASE"
    assert fake_bal.balances[(1, 50)].quantity == Decimal("6")


@pytest.mark.asyncio
async def test_update_only_cost_no_transaction():
    raw = _make_raw()
    entry_repo = FakeSupplyEntryRepo({1: raw})
    lot = _make_lot(1, "LOT-A", unit_cost=Decimal("5"), lot_id=50)
    fake_lot = FakeLotRepo({(1, "LOT-A"): lot})
    fake_bal = FakeBalanceRepo({(1, 50): _make_balance(1, 50, "10")})
    fake_txn = FakeTxnRepo()

    use_case = UpdateSupplyEntryUseCase(entry_repo, FakeItemRepo(), fake_lot, fake_bal, fake_txn)
    cmd = UpdateSupplyEntryCommand(
        entry_id=1,
        lines=[
            UpdateSupplyEntryLineCommand(line_id=101, item_id=1, quantity=Decimal("10"), unit_cost=Decimal("7"), expiration_date=_future(60), lot_code="LOT-A")
        ],
    )
    await use_case.execute(cmd)

    assert len(fake_txn.added) == 0
    assert lot.unit_cost == Decimal("7")


@pytest.mark.asyncio
async def test_update_not_found():
    entry_repo = FakeSupplyEntryRepo({})
    use_case = UpdateSupplyEntryUseCase(entry_repo, FakeItemRepo(), FakeLotRepo(), FakeBalanceRepo(), FakeTxnRepo())
    with pytest.raises(SupplyEntryNotFound):
        await use_case.execute(UpdateSupplyEntryCommand(entry_id=999, description="x"))


@pytest.mark.asyncio
async def test_update_already_cancelled():
    raw = _make_raw(status=SupplyEntryStatus.CANCELED.value)
    entry_repo = FakeSupplyEntryRepo({1: raw})
    use_case = UpdateSupplyEntryUseCase(entry_repo, FakeItemRepo(), FakeLotRepo(), FakeBalanceRepo(), FakeTxnRepo())
    with pytest.raises(SupplyEntryAlreadyCancelled):
        await use_case.execute(UpdateSupplyEntryCommand(entry_id=1, description="x"))


@pytest.mark.asyncio
async def test_update_blocked_when_consumed():
    raw = _make_raw()
    entry_repo = FakeSupplyEntryRepo({1: raw})
    lot = _make_lot(1, "LOT-A", lot_id=50)
    fake_lot = FakeLotRepo({(1, "LOT-A"): lot})
    # balance 4 < line 10 => consumed
    fake_bal = FakeBalanceRepo({(1, 50): _make_balance(1, 50, "4")})
    use_case = UpdateSupplyEntryUseCase(entry_repo, FakeItemRepo(), fake_lot, fake_bal, FakeTxnRepo())
    with pytest.raises(SupplyEntryItemsConsumed):
        await use_case.execute(UpdateSupplyEntryCommand(entry_id=1, description="intento"))


@pytest.mark.asyncio
async def test_update_blocked_when_new_quantity_below_reserved():
    raw = _make_raw()
    entry_repo = FakeSupplyEntryRepo({1: raw})
    lot = _make_lot(1, "LOT-A", lot_id=50)
    fake_lot = FakeLotRepo({(1, "LOT-A"): lot})
    fake_bal = FakeBalanceRepo({(1, 50): _make_balance(1, 50, "10", reserved="8")})
    use_case = UpdateSupplyEntryUseCase(entry_repo, FakeItemRepo(), fake_lot, fake_bal, FakeTxnRepo())
    with pytest.raises(SupplyEntryItemsConsumed):
        await use_case.execute(
            UpdateSupplyEntryCommand(
                entry_id=1,
                lines=[UpdateSupplyEntryLineCommand(line_id=101, item_id=1, quantity=Decimal("6"), unit_cost=Decimal("5"), expiration_date=_future(60), lot_code="LOT-A")],
            )
        )


@pytest.mark.asyncio
async def test_add_new_line():
    raw = _make_raw()
    entry_repo = FakeSupplyEntryRepo({1: raw})
    lot = _make_lot(1, "LOT-A", lot_id=50)
    fake_lot = FakeLotRepo({(1, "LOT-A"): lot})
    fake_bal = FakeBalanceRepo({(1, 50): _make_balance(1, 50, "10")})
    fake_txn = FakeTxnRepo()

    use_case = UpdateSupplyEntryUseCase(entry_repo, FakeItemRepo(available_ids={1, 2}), fake_lot, fake_bal, fake_txn)
    cmd = UpdateSupplyEntryCommand(
        entry_id=1,
        lines=[
            UpdateSupplyEntryLineCommand(line_id=101, item_id=1, quantity=Decimal("10"), unit_cost=Decimal("5"), expiration_date=_future(60), lot_code="LOT-A"),
            UpdateSupplyEntryLineCommand(item_id=2, quantity=Decimal("5"), unit_cost=Decimal("3"), expiration_date=_future(30), lot_code="LOT-B"),
        ],
    )
    await use_case.execute(cmd)

    assert len(entry_repo.added_lines) == 1
    assert len(fake_txn.added) == 1
    assert any(t.quantity == Decimal("5") and t.transaction_type == "PURCHASE" for t in fake_txn.added)


@pytest.mark.asyncio
async def test_remove_line():
    raw = _make_raw()
    # add second line to raw
    raw.lines.append(
        SupplyEntryLineDetailData(item_id=2, item_name="Item 2", quantity=Decimal("5"), unit_cost=Decimal("3"), expiration_date=_future(30), lot_code="LOT-B", lot_id=102)
    )
    entry_repo = FakeSupplyEntryRepo({1: raw})
    lot_a = _make_lot(1, "LOT-A", lot_id=50)
    lot_b = _make_lot(2, "LOT-B", lot_id=51)
    fake_lot = FakeLotRepo({(1, "LOT-A"): lot_a, (2, "LOT-B"): lot_b})
    fake_bal = FakeBalanceRepo({(1, 50): _make_balance(1, 50, "10"), (2, 51): _make_balance(2, 51, "5")})
    fake_txn = FakeTxnRepo()

    use_case = UpdateSupplyEntryUseCase(entry_repo, FakeItemRepo(), fake_lot, fake_bal, fake_txn)
    # send only first line -> second should be deleted
    cmd = UpdateSupplyEntryCommand(
        entry_id=1,
        lines=[UpdateSupplyEntryLineCommand(line_id=101, item_id=1, quantity=Decimal("10"), unit_cost=Decimal("5"), expiration_date=_future(60), lot_code="LOT-A")],
    )
    await use_case.execute(cmd)

    assert 102 in entry_repo.deleted_lines
    assert any(t.quantity == Decimal("-5") for t in fake_txn.added)
    assert fake_bal.balances[(2, 51)].quantity == Decimal("0")


@pytest.mark.asyncio
async def test_change_insumo_creates_new_lot():
    raw = _make_raw()
    entry_repo = FakeSupplyEntryRepo({1: raw})
    lot_a = _make_lot(1, "LOT-A", lot_id=50)
    fake_lot = FakeLotRepo({(1, "LOT-A"): lot_a})
    fake_bal = FakeBalanceRepo({(1, 50): _make_balance(1, 50, "10")})
    fake_txn = FakeTxnRepo()

    use_case = UpdateSupplyEntryUseCase(entry_repo, FakeItemRepo(available_ids={1, 2}), fake_lot, fake_bal, fake_txn)
    cmd = UpdateSupplyEntryCommand(
        entry_id=1,
        lines=[UpdateSupplyEntryLineCommand(line_id=101, item_id=2, quantity=Decimal("7"), unit_cost=Decimal("4"), expiration_date=_future(60), lot_code="LOT-NEW")],
    )
    await use_case.execute(cmd)

    # old lot reversed, new lot created
    assert any(t.quantity == Decimal("-10") for t in fake_txn.added)
    assert any(t.quantity == Decimal("7") and t.item_id == 2 for t in fake_txn.added)
    assert fake_bal.balances[(1, 50)].quantity == Decimal("0")


@pytest.mark.asyncio
async def test_duplicate_lot_code_raises():
    raw = _make_raw()
    entry_repo = FakeSupplyEntryRepo({1: raw})
    lot_a = _make_lot(1, "LOT-A", lot_id=50)
    # existing lot LOT-B for same item
    lot_b = _make_lot(1, "LOT-B", lot_id=51)
    fake_lot = FakeLotRepo({(1, "LOT-A"): lot_a, (1, "LOT-B"): lot_b})
    fake_bal = FakeBalanceRepo({(1, 50): _make_balance(1, 50, "10")})
    use_case = UpdateSupplyEntryUseCase(entry_repo, FakeItemRepo(), fake_lot, fake_bal, FakeTxnRepo())
    with pytest.raises(DuplicateLotCodeError):
        await use_case.execute(
            UpdateSupplyEntryCommand(
                entry_id=1,
                lines=[UpdateSupplyEntryLineCommand(line_id=101, item_id=1, quantity=Decimal("10"), unit_cost=Decimal("5"), expiration_date=_future(60), lot_code="LOT-B")],
            )
        )


@pytest.mark.asyncio
async def test_item_not_found_raises():
    raw = _make_raw()
    entry_repo = FakeSupplyEntryRepo({1: raw})
    fake_lot = FakeLotRepo({(1, "LOT-A"): _make_lot(1, "LOT-A", lot_id=50)})
    fake_bal = FakeBalanceRepo({(1, 50): _make_balance(1, 50, "10")})
    use_case = UpdateSupplyEntryUseCase(entry_repo, FakeItemRepo(available_ids={1}), fake_lot, fake_bal, FakeTxnRepo())
    with pytest.raises(ItemNotFoundException):
        await use_case.execute(
            UpdateSupplyEntryCommand(
                entry_id=1,
                lines=[UpdateSupplyEntryLineCommand(item_id=99, quantity=Decimal("1"), unit_cost=Decimal("1"), expiration_date=_future(60))],
            )
        )

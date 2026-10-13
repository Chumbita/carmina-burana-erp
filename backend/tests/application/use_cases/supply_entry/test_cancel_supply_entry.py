import pytest
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from src.application.use_cases.supply_entry.cancel_supply_entry import CancelSupplyEntryUseCase
from src.application.dtos.supply_entry.supply_entry_commands_dtos import CancelSupplyEntryCommand
from src.domain.repositories.supply_entry_repository import SupplyEntryDetailData, SupplyEntryLineDetailData
from src.domain.entities.inventory_lot import InventoryLot
from src.domain.entities.inventory_balance import InventoryBalance
from src.domain.exceptions.supply_entry_exceptions import (
    SupplyEntryNotFound,
    SupplyEntryAlreadyCancelled,
    SupplyEntryItemsConsumed,
)
from src.domain.value_objects.supply_entry_status import SupplyEntryStatus


def _future(days=30):
    return (datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=days)).replace(microsecond=0)


def _old_entry_date(days_ago=400):
    return datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=days_ago)


class FakeSupplyEntryRepo:
    def __init__(self, entries):
        self.entries = entries
        self.cancelled = []

    async def find_by_id(self, entry_id: int):
        return self.entries.get(entry_id)

    async def set_cancelled(self, order_id, canceled_at, reason=None):
        self.cancelled.append((order_id, canceled_at, reason))
        entry = self.entries.get(order_id)
        if entry:
            entry.status = SupplyEntryStatus.CANCELED.value
            entry.canceled_at = canceled_at
            entry.cancellation_reason = reason


class FakeLotRepo:
    def __init__(self, lots: dict):
        self.lots = lots

    async def find_by_item_and_code(self, item_id, lot_code):
        return self.lots.get((item_id, lot_code))


class FakeBalanceRepo:
    def __init__(self, balances: dict):
        self.balances = balances

    async def get_by_lot(self, item_id, lot_id):
        return self.balances.get((item_id, lot_id))

    async def save(self, balance):
        self.balances[(balance.item_id, balance.lot_id)] = balance


class FakeTxnRepo:
    def __init__(self):
        self.added = []

    async def add(self, txn):
        self.added.append(txn)


def _make_raw(entry_id=1, status=SupplyEntryStatus.CONFIRMED.value, entry_date=None, lot_code="LOT-A", qty="10"):
    return SupplyEntryDetailData(
        id=entry_id,
        document_number="DOC-1",
        supplier_id=1,
        entry_date=entry_date or datetime.now(timezone.utc).replace(tzinfo=None),
        status=status,
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        lines=[
            SupplyEntryLineDetailData(
                item_id=1,
                item_name="Item 1",
                quantity=Decimal(qty),
                unit_cost=Decimal("5"),
                expiration_date=_future(60),
                lot_code=lot_code,
                lot_id=101,
            )
        ],
    )


def _lot(item_id=1, lot_code="LOT-A", lot_id=50):
    return InventoryLot(id=lot_id, item_id=item_id, lot_code=lot_code, unit_cost=Decimal("5"), expiration_date=_future(60), created_at=datetime.now(timezone.utc).replace(tzinfo=None))


def _bal(item_id=1, lot_id=50, quantity="10", reserved="0"):
    return InventoryBalance(item_id=item_id, lot_id=lot_id, quantity=Decimal(quantity), reserved_quantity=Decimal(reserved), updated_at=datetime.now(timezone.utc).replace(tzinfo=None))


@pytest.mark.asyncio
async def test_cancel_old_entry_without_consumption_succeeds():
    # regression: 48h window removed, old entry should still cancel if intact
    raw = _make_raw(entry_date=_old_entry_date(400))
    entry_repo = FakeSupplyEntryRepo({1: raw})
    lot = _lot()
    fake_lot = FakeLotRepo({(1, "LOT-A"): lot})
    fake_bal = FakeBalanceRepo({(1, 50): _bal(quantity="10")})
    fake_txn = FakeTxnRepo()

    use_case = CancelSupplyEntryUseCase(entry_repo, fake_lot, fake_bal, fake_txn)
    result = await use_case.execute(CancelSupplyEntryCommand(entry_id=1, reason="test"))

    assert result.status.value == SupplyEntryStatus.CANCELED.value
    assert len(fake_txn.added) == 1
    assert fake_txn.added[0].quantity == Decimal("-10")
    assert fake_bal.balances[(1, 50)].quantity == Decimal("0")


@pytest.mark.asyncio
async def test_cancel_consumed_lot_raises():
    raw = _make_raw()
    entry_repo = FakeSupplyEntryRepo({1: raw})
    fake_lot = FakeLotRepo({(1, "LOT-A"): _lot()})
    fake_bal = FakeBalanceRepo({(1, 50): _bal(quantity="4")})  # 4 < 10
    use_case = CancelSupplyEntryUseCase(entry_repo, fake_lot, fake_bal, FakeTxnRepo())
    with pytest.raises(SupplyEntryItemsConsumed):
        await use_case.execute(CancelSupplyEntryCommand(entry_id=1))


@pytest.mark.asyncio
async def test_cancel_already_cancelled_raises():
    raw = _make_raw(status=SupplyEntryStatus.CANCELED.value)
    use_case = CancelSupplyEntryUseCase(FakeSupplyEntryRepo({1: raw}), FakeLotRepo({}), FakeBalanceRepo({}), FakeTxnRepo())
    with pytest.raises(SupplyEntryAlreadyCancelled):
        await use_case.execute(CancelSupplyEntryCommand(entry_id=1))


@pytest.mark.asyncio
async def test_cancel_not_found_raises():
    use_case = CancelSupplyEntryUseCase(FakeSupplyEntryRepo({}), FakeLotRepo({}), FakeBalanceRepo({}), FakeTxnRepo())
    with pytest.raises(SupplyEntryNotFound):
        await use_case.execute(CancelSupplyEntryCommand(entry_id=999))

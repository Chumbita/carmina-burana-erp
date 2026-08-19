import pytest
from datetime import datetime
from decimal import Decimal

from src.application.use_cases.production_order.discard_production_order import (
    DiscardProductionOrderUseCase,
)
from src.domain.entities.production_order import ProductionOrder, ProductionOutput
from src.domain.entities.inventory_balance import InventoryBalance
from src.domain.value_objects.production_order_status import ProductionOrderStatus
from src.domain.exceptions.production_exceptions import (
    ProductionOrderNotFoundException,
    ProductionOrderCannotBeDiscardedException,
)


def _done_order(produced: str = "100", output_lot_id: int = 11) -> ProductionOrder:
    now = datetime(2026, 1, 1)
    order = ProductionOrder(
        id=1,
        item_id=5,
        bom_id=2,
        planned_quantity=Decimal("100"),
        produced_quantity=Decimal(produced),
        status=ProductionOrderStatus.DONE,
        completed_at=now,
        created_at=now,
    )
    order.outputs = [
        ProductionOutput(
            id=1,
            production_order_id=1,
            item_id=5,
            lot_id=output_lot_id,
            quantity=Decimal(produced),
            created_at=now,
        )
    ]
    return order


def _balance(quantity: str, reserved: str = "0") -> InventoryBalance:
    return InventoryBalance(
        item_id=5,
        lot_id=11,
        quantity=Decimal(quantity),
        reserved_quantity=Decimal(reserved),
        updated_at=datetime(2026, 1, 1),
    )


class FakeProductionOrderRepository:
    def __init__(self, order):
        self.order = order
        self.saved = None

    async def get_by_id(self, order_id):
        return self.order

    async def save(self, order):
        self.saved = order
        return order


class FakeBalanceRepository:
    def __init__(self, balance):
        self.balance = balance

    async def get_by_lot(self, item_id, lot_id):
        return self.balance


class FakeInventoryMovementUseCase:
    def __init__(self):
        self.commands = []

    async def execute(self, command):
        self.commands.append(command)
        return command.lot_id


@pytest.mark.asyncio
async def test_discard_full_lot_discounts_produced_quantity():
    order = _done_order(produced="100")
    balance = _balance(quantity="100")
    movement = FakeInventoryMovementUseCase()

    use_case = DiscardProductionOrderUseCase(
        production_order_repository=FakeProductionOrderRepository(order),
        balance_repository=FakeBalanceRepository(balance),
        inventory_movement_use_case=movement,
    )

    result = await use_case.execute(1, description="Coccion fallida")

    assert result.status == ProductionOrderStatus.DISCARDED
    assert result.description == "Coccion fallida"
    assert len(movement.commands) == 1
    command = movement.commands[0]
    assert command.lot_id == 11
    assert command.item_id == 5
    assert command.quantity == Decimal("100")
    assert command.transaction_type.value == "PRODUCTION_DISCARD"
    assert command.reference_type == "production_order"
    assert command.reference_id == 1


@pytest.mark.asyncio
async def test_discard_partially_used_lot_discounts_only_available():
    order = _done_order(produced="100")
    balance = _balance(quantity="30")
    movement = FakeInventoryMovementUseCase()

    use_case = DiscardProductionOrderUseCase(
        production_order_repository=FakeProductionOrderRepository(order),
        balance_repository=FakeBalanceRepository(balance),
        inventory_movement_use_case=movement,
    )

    result = await use_case.execute(1)

    assert result.status == ProductionOrderStatus.DISCARDED
    assert len(movement.commands) == 1
    assert movement.commands[0].quantity == Decimal("30")


@pytest.mark.asyncio
async def test_discard_depleted_lot_registers_no_movement():
    order = _done_order(produced="100")
    balance = _balance(quantity="0")
    movement = FakeInventoryMovementUseCase()

    use_case = DiscardProductionOrderUseCase(
        production_order_repository=FakeProductionOrderRepository(order),
        balance_repository=FakeBalanceRepository(balance),
        inventory_movement_use_case=movement,
    )

    result = await use_case.execute(1)

    assert result.status == ProductionOrderStatus.DISCARDED
    assert movement.commands == []


@pytest.mark.asyncio
async def test_discard_without_balance_registers_no_movement():
    order = _done_order(produced="100")
    movement = FakeInventoryMovementUseCase()

    use_case = DiscardProductionOrderUseCase(
        production_order_repository=FakeProductionOrderRepository(order),
        balance_repository=FakeBalanceRepository(None),
        inventory_movement_use_case=movement,
    )

    result = await use_case.execute(1)

    assert result.status == ProductionOrderStatus.DISCARDED
    assert movement.commands == []


@pytest.mark.asyncio
async def test_discard_non_done_order_raises():
    now = datetime(2026, 1, 1)
    order = ProductionOrder(
        id=1,
        item_id=5,
        bom_id=2,
        planned_quantity=Decimal("100"),
        status=ProductionOrderStatus.PLANNED,
        created_at=now,
    )
    movement = FakeInventoryMovementUseCase()

    use_case = DiscardProductionOrderUseCase(
        production_order_repository=FakeProductionOrderRepository(order),
        balance_repository=FakeBalanceRepository(_balance(quantity="100")),
        inventory_movement_use_case=movement,
    )

    with pytest.raises(ProductionOrderCannotBeDiscardedException):
        await use_case.execute(1)

    assert movement.commands == []


@pytest.mark.asyncio
async def test_discard_missing_order_raises():
    class EmptyRepository:
        async def get_by_id(self, order_id):
            return None

    use_case = DiscardProductionOrderUseCase(
        production_order_repository=EmptyRepository(),
        balance_repository=FakeBalanceRepository(None),
        inventory_movement_use_case=FakeInventoryMovementUseCase(),
    )

    with pytest.raises(ProductionOrderNotFoundException):
        await use_case.execute(999)

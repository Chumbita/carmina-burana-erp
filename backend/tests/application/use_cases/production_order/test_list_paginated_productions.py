import pytest
from datetime import date, datetime
from decimal import Decimal

from src.shared.pagination import PaginationParams


class FakeProductionOrderRepository:
    def __init__(self, incomplete_items=None, history_items=None):
        self._incomplete = incomplete_items or []
        self._history = history_items or []

    async def list_incomplete_paginated(self, *, offset, limit, q=None, **kw):
        items = self._incomplete
        if q:
            items = [it for it in items if q.lower() in it["item_name"].lower()]
        return items[offset : offset + limit], len(items)

    async def list_history_paginated(
        self, *, offset, limit, q=None, status=None, date_field=None,
        date_from=None, date_to=None, sort_by="production_date", sort_order="desc", **kw
    ):
        items = self._history
        if q:
            items = [it for it in items if q.lower() in it["item_name"].lower()]
        if status:
            items = [it for it in items if it["status"] == status]
        return items[offset : offset + limit], len(items)


class FakeBomRepository:
    async def get_detailed_bom_by_id(self, bom_id):
        return {"id": bom_id, "lines": []}


class FakeBalanceRepository:
    async def get_by_item_id(self, item_id):
        return None


class FakeLotRepository:
    async def find_by_item_id(self, item_id):
        return []


class FakeStockService:
    async def calculate_unit_cost(self, *, bom, planned_quantity):
        return Decimal("10.50")


def _make_incomplete_items(n=3):
    return [
        {
            "id": i,
            "item_name": f"Cerveza-{i}",
            "bom_version": 1,
            "planned_quantity": Decimal("100"),
            "base_uom_symbol": "L",
            "schedule_date": date(2026, 1, i),
            "status": "PLANNED",
            "bom_id": 1,
        }
        for i in range(1, n + 1)
    ]


def _make_history_items(n=3):
    return [
        {
            "id": i,
            "item_name": f"Cerveza-{i}",
            "bom_version": 1,
            "produced_quantity": Decimal("90"),
            "base_uom_symbol": "L",
            "schedule_date": date(2026, 1, i),
            "completed_at": datetime(2026, 1, i + 10),
            "status": "DONE",
        }
        for i in range(1, n + 1)
    ]


@pytest.mark.asyncio
async def test_list_incomplete_paginated_returns_page():
    from src.application.use_cases.production_order.get_production_order import (
        ListIncompleteProductionsUseCase,
    )

    items = _make_incomplete_items(5)
    repo = FakeProductionOrderRepository(incomplete_items=items)

    use_case = ListIncompleteProductionsUseCase(
        production_order_repository=repo,
        bom_repository=FakeBomRepository(),
        balance_repository=FakeBalanceRepository(),
        lot_repository=FakeLotRepository(),
    )
    use_case._stock_service = FakeStockService()

    params = PaginationParams(page=1, page_size=2)
    result = await use_case.execute(params)

    assert len(result.items) == 2
    assert result.total_items == 5
    assert result.total_pages == 3


@pytest.mark.asyncio
async def test_list_incomplete_paginated_filters_by_q():
    from src.application.use_cases.production_order.get_production_order import (
        ListIncompleteProductionsUseCase,
    )

    items = _make_incomplete_items(3)
    repo = FakeProductionOrderRepository(incomplete_items=items)

    use_case = ListIncompleteProductionsUseCase(
        production_order_repository=repo,
        bom_repository=FakeBomRepository(),
        balance_repository=FakeBalanceRepository(),
        lot_repository=FakeLotRepository(),
    )
    use_case._stock_service = FakeStockService()

    params = PaginationParams(page=1, page_size=10)
    result = await use_case.execute(params, q="Cerveza-1")

    assert len(result.items) == 1
    assert result.items[0]["item_name"] == "Cerveza-1"


@pytest.mark.asyncio
async def test_list_history_paginated_returns_page():
    from src.application.use_cases.production_order.get_production_order import (
        ListFinishedProductionsUseCase,
    )

    items = _make_history_items(5)
    repo = FakeProductionOrderRepository(history_items=items)

    use_case = ListFinishedProductionsUseCase(production_order_repository=repo)
    params = PaginationParams(page=1, page_size=2)

    result = await use_case.execute(params, date_field="completed_at")

    assert len(result.items) == 2
    assert result.total_items == 5
    assert result.total_pages == 3


@pytest.mark.asyncio
async def test_list_history_paginated_filters_by_status():
    from src.application.use_cases.production_order.get_production_order import (
        ListFinishedProductionsUseCase,
    )

    items = [
        {"id": 1, "item_name": "A", "bom_version": 1, "produced_quantity": Decimal("10"), "base_uom_symbol": "L", "schedule_date": date(2026, 1, 1), "completed_at": datetime(2026, 1, 2), "status": "DONE"},
        {"id": 2, "item_name": "B", "bom_version": 1, "produced_quantity": Decimal("10"), "base_uom_symbol": "L", "schedule_date": date(2026, 1, 1), "completed_at": datetime(2026, 1, 3), "status": "CANCELLED"},
    ]
    repo = FakeProductionOrderRepository(history_items=items)

    use_case = ListFinishedProductionsUseCase(production_order_repository=repo)
    params = PaginationParams(page=1, page_size=10)

    result = await use_case.execute(params, date_field="completed_at", status="DONE")

    assert len(result.items) == 1
    assert result.items[0]["status"] == "DONE"


@pytest.mark.asyncio
async def test_list_history_paginated_empty_result():
    from src.application.use_cases.production_order.get_production_order import (
        ListFinishedProductionsUseCase,
    )

    repo = FakeProductionOrderRepository(history_items=[])
    use_case = ListFinishedProductionsUseCase(production_order_repository=repo)
    params = PaginationParams(page=1, page_size=10)

    result = await use_case.execute(params, date_field="completed_at")

    assert result.items == []
    assert result.total_items == 0
    assert result.total_pages == 0


@pytest.mark.asyncio
async def test_list_history_paginated_date_field_optional():
    """date_field es opcional; funciona con None y con cualquier valor."""
    from src.application.use_cases.production_order.get_production_order import (
        ListFinishedProductionsUseCase,
    )

    items = _make_history_items(3)
    repo = FakeProductionOrderRepository(history_items=items)
    use_case = ListFinishedProductionsUseCase(production_order_repository=repo)
    params = PaginationParams(page=1, page_size=10)

    result = await use_case.execute(params)

    assert len(result.items) == 3


@pytest.mark.asyncio
async def test_list_history_paginated_receives_date_field_in_repo():
    """Verifica que date_field se propaga correctamente al repository."""
    from src.application.use_cases.production_order.get_production_order import (
        ListFinishedProductionsUseCase,
    )

    class SpyRepo:
        def __init__(self):
            self.received_date_field = None

        async def list_history_paginated(
            self, *, offset, limit, q=None, status=None, date_field=None,
            date_from=None, date_to=None, sort_by="production_date", sort_order="desc", **kw
        ):
            self.received_date_field = date_field
            return [], 0

    spy = SpyRepo()
    use_case = ListFinishedProductionsUseCase(production_order_repository=spy)
    params = PaginationParams(page=1, page_size=10)

    await use_case.execute(params, date_field="schedule_date")

    assert spy.received_date_field == "schedule_date"

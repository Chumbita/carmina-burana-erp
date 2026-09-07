import pytest

from src.shared.pagination import PaginationParams


class FakeBomRepository:
    """Fake repository for testing list_active_boms_paginated."""

    def __init__(self, total_items: int = 5):
        self._total = total_items

    async def list_active_boms_paginated(
        self,
        *,
        offset: int,
        limit: int,
        q=None,
        sort_by="name",
        sort_order="asc",
    ):
        all_items = [
            {"id": i, "parent_item_name": f"BOM-{i}", "version": 1}
            for i in range(1, self._total + 1)
        ]
        if q:
            all_items = [it for it in all_items if q.lower() in it["parent_item_name"].lower()]
        rows = all_items[offset : offset + limit]
        return rows, len(all_items)


@pytest.mark.asyncio
async def test_list_active_boms_paginated_returns_first_page():
    repo = FakeBomRepository(total_items=5)
    from src.application.use_cases.bom.list_active_boms_use_case import (
        ListActiveBomsUseCase,
    )

    use_case = ListActiveBomsUseCase(bom_repository=repo)
    params = PaginationParams(page=1, page_size=2)

    result = await use_case.execute(params)

    assert len(result.items) == 2
    assert result.total_items == 5
    assert result.total_pages == 3
    assert result.params.page == 1


@pytest.mark.asyncio
async def test_list_active_boms_paginated_returns_last_partial_page():
    repo = FakeBomRepository(total_items=5)
    from src.application.use_cases.bom.list_active_boms_use_case import (
        ListActiveBomsUseCase,
    )

    use_case = ListActiveBomsUseCase(bom_repository=repo)
    params = PaginationParams(page=3, page_size=2)

    result = await use_case.execute(params)

    assert len(result.items) == 1
    assert result.total_items == 5


@pytest.mark.asyncio
async def test_list_active_boms_paginated_filters_by_q():
    class FilteringRepo:
        async def list_active_boms_paginated(self, *, offset, limit, q=None, **kw):
            items = [
                {"id": 1, "parent_item_name": "IPA"},
                {"id": 2, "parent_item_name": "Stout"},
            ]
            if q:
                items = [it for it in items if q.lower() in it["parent_item_name"].lower()]
            return items[offset : offset + limit], len(items)

    from src.application.use_cases.bom.list_active_boms_use_case import (
        ListActiveBomsUseCase,
    )

    use_case = ListActiveBomsUseCase(bom_repository=FilteringRepo())
    params = PaginationParams(page=1, page_size=10)

    result = await use_case.execute(params, q="IPA")

    assert len(result.items) == 1
    assert result.items[0]["parent_item_name"] == "IPA"


@pytest.mark.asyncio
async def test_list_active_boms_paginated_empty_result():
    repo = FakeBomRepository(total_items=0)
    from src.application.use_cases.bom.list_active_boms_use_case import (
        ListActiveBomsUseCase,
    )

    use_case = ListActiveBomsUseCase(bom_repository=repo)
    params = PaginationParams(page=1, page_size=10)

    result = await use_case.execute(params)

    assert result.items == []
    assert result.total_items == 0
    assert result.total_pages == 0

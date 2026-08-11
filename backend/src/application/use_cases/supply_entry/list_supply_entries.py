from datetime import date
from typing import Optional

from src.domain.repositories.supply_entry_repository import (
    ISupplyEntryRepository,
    SupplyEntryListItemData,
)
from src.domain.value_objects.supply_entry_status import SupplyEntryStatus
from src.presentation.schemas.supply_entry_schema import (
    SupplierListRef,
    SupplyEntryListItemResponse,
)
from src.shared.pagination import Page, PaginationParams


class ListSupplyEntries:

    def __init__(self, supply_entry_repo: ISupplyEntryRepository) -> None:
        self._supply_entry_repo = supply_entry_repo

    async def execute(
        self,
        params: PaginationParams,
        supplier_id: Optional[int] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        search: Optional[str] = None,
    ) -> Page[dict]:
        raw_data, total = await self._supply_entry_repo.find_all(
            supplier_id=supplier_id,
            date_from=date_from,
            date_to=date_to,
            search=search,
            offset=params.offset,
            limit=params.limit,
        )

        return Page(
            items=[self._build_item(data).model_dump() for data in raw_data],
            total_items=total,
            params=params,
        )

    # ── Helpers ─────────────────────────────────────────────────────

    @staticmethod
    def _build_item(data: SupplyEntryListItemData) -> SupplyEntryListItemResponse:
        supplier = None
        if data.supplier_id is not None and data.supplier_name is not None:
            supplier = SupplierListRef(
                id=data.supplier_id,
                name=data.supplier_name,
            )

        return SupplyEntryListItemResponse(
            id=data.id,
            document_number=data.document_number,
            supplier=supplier,
            entry_date=data.entry_date,
            description=data.description,
            cancellation_reason=data.cancellation_reason,
            status=SupplyEntryStatus(data.status),
            created_at=data.created_at,
            canceled_at=data.canceled_at,
            items_count=data.items_count,
            total_cost=data.total_cost,
        )

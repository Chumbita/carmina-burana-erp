from src.application.dtos.supply_entry.supply_entry_responses_dtos import (
    SupplyEntryListResponse,
    SupplyEntryListItemResponse,
    SupplierListRef,
)
from src.domain.repositories.supply_entry_repository import (
    ISupplyEntryRepository,
    SupplyEntryListItemData,
)
from src.domain.value_objects.supply_entry_status import SupplyEntryStatus


class ListSupplyEntries:

    def __init__(self, supply_entry_repo: ISupplyEntryRepository) -> None:
        self._supply_entry_repo = supply_entry_repo

    async def execute(self) -> SupplyEntryListResponse:
        raw_data = await self._supply_entry_repo.find_all()

        return SupplyEntryListResponse(
            data=[self._build_item(data) for data in raw_data],
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
            status=SupplyEntryStatus(data.status),
            created_at=data.created_at,
            items_count=data.items_count,
            total_cost=data.total_cost,
        )

from src.application.dtos.supply_entry.supply_entry_responses_dtos import (
    SupplyEntryDetailResponse,
    SupplyEntryDetailLineResponse,
    SupplierRef,
    ItemRef,
)
from src.domain.repositories.supply_entry_repository import (
    ISupplyEntryRepository,
    SupplyEntryDetailData,
)
from src.domain.exceptions.supply_entry_exceptions import SupplyEntryNotFound
from src.domain.value_objects.supply_entry_status import SupplyEntryStatus


class GetSupplyEntryDetail:

    def __init__(self, supply_entry_repo: ISupplyEntryRepository) -> None:
        self._supply_entry_repo = supply_entry_repo

    async def execute(self, entry_id: int) -> SupplyEntryDetailResponse:
        raw = await self._supply_entry_repo.find_by_id(entry_id)
        if raw is None:
            raise SupplyEntryNotFound(f"Supply entry with id {entry_id} not found")

        return SupplyEntryDetailResponse(
            id=raw.id,
            document_number=raw.document_number,
            supplier=self._build_supplier(raw),
            entry_date=raw.entry_date,
            description=raw.description,
            status=SupplyEntryStatus(raw.status),
            created_at=raw.created_at,
            lines=self._build_lines(raw.lines),
        )

    # ── Helpers ─────────────────────────────────────────────────────

    @staticmethod
    def _build_supplier(raw: SupplyEntryDetailData) -> SupplierRef | None:
        if raw.supplier_id is None or raw.supplier_name is None:
            return None
        return SupplierRef(
            id=raw.supplier_id,
            name=raw.supplier_name,
            phone=raw.supplier_phone,
        )

    @staticmethod
    def _build_lines(
        raw_lines: list,
    ) -> list[SupplyEntryDetailLineResponse]:
        return [
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
            for line in raw_lines
        ]

from typing import Optional, Protocol
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal

from src.domain.entities.supply_entry import SupplyEntryOrder, SupplyEntryLine


class ISupplyEntryRepository(Protocol):

    async def add_order(self, order: SupplyEntryOrder) -> SupplyEntryOrder:
        ...

    async def add_line(self, line: SupplyEntryLine, supply_entry_id: int) -> None:
        ...

    async def find_by_id(self, entry_id: int) -> Optional["SupplyEntryDetailData"]:
        ...

    async def find_all(self) -> list["SupplyEntryListItemData"]:
        ...

    async def set_cancelled(
        self, order_id: int, canceled_at: datetime, reason: Optional[str] = None
    ) -> None:
        ...


# ═══════════════════════════════════════════════════
# Raw query result types  —  devueltos por find_by_id
# ═══════════════════════════════════════════════════

@dataclass
class SupplyEntryLineDetailData:
    item_id: int
    item_name: str
    brand_name: Optional[str] = None
    quantity: Decimal = Decimal("0")
    unit_cost: Decimal = Decimal("0")
    expiration_date: Optional[datetime] = None
    lot_code: Optional[str] = None
    lot_id: Optional[int] = None
    comment: Optional[str] = None


@dataclass
class SupplyEntryDetailData:
    id: int
    document_number: str
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    supplier_phone: Optional[str] = None
    entry_date: Optional[datetime] = None
    description: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    canceled_at: Optional[datetime] = None
    lines: list[SupplyEntryLineDetailData] = field(default_factory=list)


# ═══════════════════════════════════════════════════
# Raw query result types  —  devueltos por find_all
# ═══════════════════════════════════════════════════

@dataclass
class SupplyEntryListItemData:
    id: int
    document_number: str
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    entry_date: Optional[datetime] = None
    description: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    canceled_at: Optional[datetime] = None
    items_count: int = 0
    total_cost: Decimal = Decimal("0")

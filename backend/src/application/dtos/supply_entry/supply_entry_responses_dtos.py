from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional

from src.domain.value_objects.supply_entry_status import SupplyEntryStatus


@dataclass
class SupplyEntryLineResponse:
    item_id: int
    quantity: Decimal
    unit_cost: Decimal
    expiration_date: datetime
    lot_code: Optional[str] = None
    lot_id: Optional[int] = None
    comment: Optional[str] = None

    @property
    def subtotal(self) -> Decimal:
        return self.quantity * self.unit_cost


@dataclass
class SupplyEntryResponse:
    id: int
    document_number: str
    supplier_id: Optional[int] = None
    entry_date: datetime = field(default_factory=datetime.now)
    description: Optional[str] = None
    status: SupplyEntryStatus = SupplyEntryStatus.CONFIRMED
    created_at: datetime = field(default_factory=datetime.now)
    lines: list[SupplyEntryLineResponse] = field(default_factory=list)

    @property
    def total_cost(self) -> Decimal:
        return sum(line.subtotal for line in self.lines)


# ═══════════════════════════════════════════════════
# Detail response types (GET /supply-entries/{id})
# ═══════════════════════════════════════════════════

@dataclass
class SupplierRef:
    id: int
    name: str
    phone: Optional[str] = None


@dataclass
class ItemRef:
    id: int
    name: str
    brand_name: Optional[str] = None


@dataclass
class SupplyEntryDetailLineResponse:
    item: ItemRef
    quantity: Decimal
    unit_cost: Decimal
    expiration_date: datetime
    lot_code: Optional[str] = None
    lot_id: Optional[int] = None
    comment: Optional[str] = None

    @property
    def subtotal(self) -> Decimal:
        return self.quantity * self.unit_cost


@dataclass
class SupplyEntryDetailResponse:
    id: int
    document_number: str
    supplier: Optional[SupplierRef] = None
    entry_date: Optional[datetime] = None
    description: Optional[str] = None
    status: Optional[SupplyEntryStatus] = None
    created_at: Optional[datetime] = None
    lines: list[SupplyEntryDetailLineResponse] = field(default_factory=list)

    @property
    def total_cost(self) -> Decimal:
        return sum(line.subtotal for line in self.lines)


# ═══════════════════════════════════════════════════
# List response types (GET /supply-entries)
# ═══════════════════════════════════════════════════

@dataclass
class SupplierListRef:
    id: int
    name: str


@dataclass
class SupplyEntryListItemResponse:
    id: int
    document_number: str
    supplier: Optional[SupplierListRef] = None
    entry_date: Optional[datetime] = None
    description: Optional[str] = None
    status: Optional[SupplyEntryStatus] = None
    created_at: Optional[datetime] = None
    items_count: int = 0
    total_cost: Decimal = Decimal("0")


@dataclass
class SupplyEntryListResponse:
    data: list[SupplyEntryListItemResponse] = field(default_factory=list)

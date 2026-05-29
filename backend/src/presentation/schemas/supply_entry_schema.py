from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal

from src.domain.value_objects.supply_entry_status import SupplyEntryStatus


# ── Request ──────────────────────────────────────────────────────────

class SupplyEntryLineRequest(BaseModel):
    item_id: int
    quantity: Decimal = Field(..., gt=0)
    unit_cost: Decimal = Field(..., gt=0)
    expiration_date: datetime
    lot_code: Optional[str] = None
    comment: Optional[str] = None


class CreateSupplyEntryRequest(BaseModel):
    supplier_id: Optional[int] = None
    document_number: Optional[str] = None
    entry_date: Optional[datetime] = None
    description: Optional[str] = None
    lines: list[SupplyEntryLineRequest] = Field(..., min_length=1)


# ── Detail Response (GET /supply-entries/{id}) & (POST /supply_entries)───────

class SupplierRef(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None


class ItemRef(BaseModel):
    id: int
    name: str
    brand_name: Optional[str] = None


class SupplyEntryDetailLineResponse(BaseModel):
    item: ItemRef
    quantity: Decimal
    unit_cost: Decimal
    expiration_date: datetime
    lot_code: Optional[str] = None
    lot_id: Optional[int] = None
    comment: Optional[str] = None
    subtotal: Decimal

    class Config:
        from_attributes = True


class SupplyEntryDetailResponse(BaseModel):
    id: int
    document_number: str
    supplier: Optional[SupplierRef] = None
    entry_date: datetime
    description: Optional[str] = None
    status: SupplyEntryStatus
    created_at: datetime
    total_cost: Decimal
    lines: list[SupplyEntryDetailLineResponse]

    class Config:
        from_attributes = True


# ── List Response (GET /supply-entries) ─────────────────────────────

class SupplierListRef(BaseModel):
    id: int
    name: str


class SupplyEntryListItemResponse(BaseModel):
    id: int
    document_number: str
    supplier: Optional[SupplierListRef] = None
    entry_date: datetime
    description: Optional[str] = None
    status: SupplyEntryStatus
    created_at: datetime
    items_count: int
    total_cost: Decimal

    class Config:
        from_attributes = True


class SupplyEntryListResponse(BaseModel):
    data: list[SupplyEntryListItemResponse]

    class Config:
        from_attributes = True

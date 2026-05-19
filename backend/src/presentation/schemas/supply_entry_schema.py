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
    comment: Optional[str] = None


class CreateSupplyEntryRequest(BaseModel):
    supplier_id: Optional[int] = None
    document_number: Optional[str] = None
    entry_date: Optional[datetime] = None
    description: Optional[str] = None
    lines: list[SupplyEntryLineRequest] = Field(..., min_length=1)


# ── Response ─────────────────────────────────────────────────────────

class SupplyEntryLineResponse(BaseModel):
    item_id: int
    quantity: Decimal
    unit_cost: Decimal
    expiration_date: datetime
    lot_code: Optional[str] = None
    lot_id: Optional[int] = None
    comment: Optional[str] = None
    subtotal: Decimal

    class Config:
        from_attributes = True


class SupplyEntryResponse(BaseModel):
    id: int
    document_number: str
    supplier_id: Optional[int] = None
    entry_date: datetime
    description: Optional[str] = None
    status: SupplyEntryStatus
    created_at: datetime
    total_cost: Decimal
    lines: list[SupplyEntryLineResponse]

    class Config:
        from_attributes = True

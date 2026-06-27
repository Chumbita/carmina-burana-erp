# ══════════════════════════════════════════════════════════════════════════════
# SCHEMAS PYDANTIC - BOM
# ══════════════════════════════════════════════════════════════════════════════

from pydantic import BaseModel, Field
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional


# ── REQUESTS ────────────────────────────────────────────────

class CreateBomLineRequestSchema(BaseModel):
    component_item_id: int
    quantity: Decimal = Field(..., gt=0)
    uom: Optional[int] = None


class CreateBomRequestSchema(BaseModel):
    parent_item_id: int
    quantity: Decimal = Field(..., gt=0)
    uom_id: int
    valid_from: Optional[datetime] = None
    lines: List[CreateBomLineRequestSchema] = Field(..., min_length=1)


# ── RESPONSES ────────────────────────────────────────────────

class BomCreatedResponseSchema(BaseModel):
    id: int
    parent_item_id: int
    parent_item_name: str
    version: int
    components_count: int
    quantity: Decimal
    uom_id: int
    uom_symbol: str
    valid_from: datetime

    class Config:
        from_attributes = True


class BomListItemResponseSchema(BaseModel):
    id: int
    parent_item_id: int
    parent_item_name: str
    version: int
    components_count: int
    valid_from: datetime

    class Config:
        from_attributes = True


class BomLineDetailSchema(BaseModel):
    id: Optional[int] = None
    component_item_id: int
    component_item_name: str
    quantity: Decimal
    uom_id: Optional[int] = None
    uom_symbol: Optional[str] = None

    class Config:
        from_attributes = True


class BomDetailResponseSchema(BaseModel):
    id: int
    parent_item_id: int
    parent_item_name: str
    version: int
    components_count: int
    valid_from: datetime
    created_at: datetime
    lines: List[BomLineDetailSchema] = []

    class Config:
        from_attributes = True

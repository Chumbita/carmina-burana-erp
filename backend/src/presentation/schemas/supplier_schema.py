from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

from src.domain.value_objects.supplier_status import SupplierStatus


# ── Request ──────────────────────────────────────────────────────────

class CreateSupplierRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


# ── Response ─────────────────────────────────────────────────────────

class SupplierResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: SupplierStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

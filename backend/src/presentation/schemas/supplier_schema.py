from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

from src.domain.value_objects.supplier_status import SupplierStatus


# ── Request ──────────────────────────────────────────────────────────

class CreateSupplierRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Invalid email format")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        if not value.isdigit():
            raise ValueError("Phone must contain only digits")
        return value


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

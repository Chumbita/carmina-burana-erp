from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from src.domain.value_objects.supplier_status import SupplierStatus


@dataclass
class SupplierResponse:
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: SupplierStatus = SupplierStatus.ACTIVE
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class SupplierOptionResponse:
    id: int
    name: str

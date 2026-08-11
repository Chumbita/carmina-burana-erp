from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateSupplierCommand:
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


@dataclass
class UpdateSupplierCommand:
    supplier_id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

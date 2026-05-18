from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional


@dataclass
class SupplyEntryLineCommand:
    item_id: int
    quantity: Decimal
    unit_cost: Decimal
    expiration_date: datetime
    comment: Optional[str] = None


@dataclass
class CreateSupplyEntryCommand:
    supplier_id: Optional[int] = None
    document_number: Optional[str] = None
    entry_date: Optional[datetime] = None
    description: Optional[str] = None
    lines: list[SupplyEntryLineCommand] = field(default_factory=list)

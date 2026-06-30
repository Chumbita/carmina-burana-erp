# ══════════════════════════════════════════════════════════════════════════════
# DTOs - COMMANDS DE BOM
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import List, Optional


@dataclass
class CreateBomLineData:
    """
    DTO para una línea de componente dentro de un BOM.
    """
    component_item_id: int
    quantity: Decimal
    uom: Optional[int] = None

    def __post_init__(self) -> None:
        if self.component_item_id is None:
            raise ValueError("component_item_id is required")
        if self.quantity is None or self.quantity <= Decimal("0"):
            raise ValueError("quantity must be greater than zero")


@dataclass
class CreateBomCommand:
    """
    Comando de creación de un BOM con todas sus líneas.
    """
    parent_item_id: int
    quantity: Decimal
    uom_id: int
    valid_from: Optional[datetime] = None
    lines: List[CreateBomLineData] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.lines:
            raise ValueError("BOM must have at least one BomLine")
        if self.quantity is None or self.quantity <= Decimal("0"):
            raise ValueError("quantity must be greater than zero")
        if self.uom_id is None:
            raise ValueError("uom_id is required")

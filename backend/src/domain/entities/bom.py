# ══════════════════════════════════════════════════════════════════════════════
# BOM ENTITY
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional


@dataclass
class Bom:
    """
    Bill of Materials. Representa la lista de materiales de un ítem padre,
    con soporte para versionado y vigencia temporal.
    """

    parent_item_id: int
    version: int
    is_active: bool
    quantity: Decimal
    uom_id: int
    valid_from: datetime
    created_at: datetime

    id: Optional[int] = None
    valid_to: Optional[datetime] = None
    lines: list["BomLine"] = field(default_factory=list)


    # ── Initialization & Validation ────────────────────────────────

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if self.parent_item_id is None:
            raise ValueError("parent_item_id is required")

        if self.version is None or self.version < 1:
            raise ValueError("version must be a positive integer (>= 1)")

        if self.valid_from is None:
            raise ValueError("valid_from is required")

        if self.valid_to is not None and self.valid_to < self.valid_from:
            raise ValueError("valid_to cannot be earlier than valid_from")

        if self.quantity is None or self.quantity <= Decimal("0"):
            raise ValueError("quantity must be greater than zero")

        if self.uom_id is None:
            raise ValueError("uom_id is required")


@dataclass
class BomLine:
    """
    Línea de componente dentro de un BOM.
    """

    component_item_id: int
    quantity: Decimal
    created_at: datetime

    id: Optional[int] = None
    bom_id: Optional[int] = None
    uom: Optional[int] = None


    # ── Initialization & Validation ────────────────────────────────

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if self.component_item_id is None:
            raise ValueError("component_item_id is required")

        if self.quantity is None or self.quantity <= Decimal("0"):
            raise ValueError("quantity must be greater than zero")

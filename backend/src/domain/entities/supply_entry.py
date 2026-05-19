# ══════════════════════════════════════════════════════════════════════════════
# SUPPLY ENTRY ORDER AND LINE ENTITIES
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional

from src.domain.value_objects.supply_entry_status import SupplyEntryStatus


@dataclass
class SupplyEntryLine:
    """
    Representa un artículo dentro de una orden de recepción.
    No conoce su supply_entry_id: eso es un detalle de persistencia
    que resuelve el mapper de infraestructura.
    """

    item_id: int
    quantity: Decimal
    unit_cost: Decimal
    expiration_date: datetime
    comment: Optional[str] = None
    lot_code: Optional[str] = None   # Null hasta que la orden se confirma
    id: Optional[int] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if self.item_id is None:
            raise ValueError("item_id is required")
        if self.quantity is None or self.quantity <= 0:
            raise ValueError("quantity must be greater than zero")
        if self.unit_cost is None or self.unit_cost <= 0:
            raise ValueError("unit_cost must be greater than zero")
        if self.expiration_date is None:
            raise ValueError("expiration_date is required")

    # ── Attribute Mutators ─────────────────────────────────────────

    def assign_lot(self, lot_code: str) -> None:
        """Vincula el lote generado a esta línea al confirmar la recepción."""
        if not lot_code or not lot_code.strip():
            raise ValueError("lot_code cannot be empty")
        self.lot_code = lot_code


@dataclass
class SupplyEntryOrder:
    """
    Aggregate root de la recepción de insumos.
    Contiene sus líneas como colección interna y es el único
    punto de entrada para modificarlas.
    """

    document_number: str
    entry_date: datetime
    created_at: datetime
    supplier_id: Optional[int] = None
    description: Optional[str] = None
    lines: list[SupplyEntryLine] = field(default_factory=list)
    status: SupplyEntryStatus = SupplyEntryStatus.DRAFT
    id: Optional[int] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if not self.document_number or not self.document_number.strip():
            raise ValueError("document_number is required")
        if self.entry_date is None:
            raise ValueError("entry_date is required")

    # ── State Transitions ──────────────────────────────────────────

    def confirm(self) -> None:
        """DRAFT → CONFIRMED. Requiere al menos una línea."""
        self._guard_not_cancelled("confirm")
        if self.status == SupplyEntryStatus.CONFIRMED:
            raise ValueError("Supply entry order is already confirmed")
        if not self.lines:
            raise ValueError("Cannot confirm an order with no lines")
        self.status = SupplyEntryStatus.CONFIRMED

    def cancel(self) -> None:
        """DRAFT → CANCELLED. No se puede cancelar una orden ya confirmada."""
        self._guard_not_cancelled("cancel")
        if self.status == SupplyEntryStatus.CONFIRMED:
            raise ValueError("Cannot cancel a confirmed order")
        self.status = SupplyEntryStatus.CANCELED

    # ── Aggregate Operations ───────────────────────────────────────

    def add_line(self, line: SupplyEntryLine) -> None:
        """Agrega una línea a la orden. Solo permitido en estado DRAFT."""
        self._guard_not_confirmed("add lines to")
        self._guard_not_cancelled("add lines to")
        self.lines.append(line)

    # ── Status Checks ──────────────────────────────────────────────

    def is_confirmed(self) -> bool:
        return self.status == SupplyEntryStatus.CONFIRMED

    def is_cancelled(self) -> bool:
        return self.status == SupplyEntryStatus.CANCELED

    # ── Internal Guards ────────────────────────────────────────────

    def _guard_not_confirmed(self, operation: str) -> None:
        if self.is_confirmed():
            raise ValueError(
                f"Cannot {operation} a confirmed supply entry order (id={self.id})"
            )

    def _guard_not_cancelled(self, operation: str) -> None:
        if self.is_cancelled():
            raise ValueError(
                f"Cannot {operation} a cancelled supply entry order (id={self.id})"
            )
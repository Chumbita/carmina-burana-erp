# ══════════════════════════════════════════════════════════════════════════════
# SUPPLIER ENTITY
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from src.domain.value_objects.supplier_status import SupplierStatus


@dataclass
class Supplier:

    # Atributos esenciales
    name: str

    # Atributos de contacto
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    # Metadatos (inyectados)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Identidad
    id: Optional[int] = None

    # Estado
    status: SupplierStatus = SupplierStatus.ACTIVE

    # ── Initialization & Validation ─────────────────────────────────

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if not self.name or not self.name.strip():
            raise ValueError("Supplier name is required")

    # ── State Transitions ──────────────────────────────────────────

    def activate(self) -> None:
        if self.status == SupplierStatus.ACTIVE:
            raise ValueError("Supplier is already active")
        self.status = SupplierStatus.ACTIVE
        self.updated_at = datetime.now()

    def deactivate(self) -> None:
        if self.status == SupplierStatus.INACTIVE:
            raise ValueError("Supplier is already inactive")
        self.status = SupplierStatus.INACTIVE
        self.updated_at = datetime.now()

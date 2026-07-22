# ══════════════════════════════════════════════════════════════════════════════
# PACKAGING SUPPLY ENTITY
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Optional
from src.domain.value_objects.packaging_type import PackagingType

@dataclass
class PackagingSupply:
    """
    Entidad especializada de Item.
    Representa insumos de packaging (botellas, latas, cajas, etc.).
    """

    # Identidad
    item_id: int

    # Atributos esenciales
    packaging_type: PackagingType
    material: str

    # Metadatos
    created_at: datetime

    # Atributos opcionales
    capacity_ml: Optional[Decimal] = None
    updated_at: Optional[datetime] = None


    # ── Initialization & Validation ────────────────────────────────

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if self.item_id is None:
            raise ValueError("item_id is required")

        if not self.packaging_type:
            raise ValueError("packaging_type is required")

        if self.packaging_type not in PackagingType.__members__.values():
            raise ValueError(f"Invalid packaging_type: {self.packaging_type}")

        if not self.material or not self.material.strip():
            raise ValueError("material is required")

        if self.capacity_ml is not None and self.capacity_ml < 0:
            raise ValueError("capacity_ml cannot be negative")

    # ── Attribute Mutators ────────────────────────────────────────

    def update(
        self,
        packaging_type: Optional[PackagingType] = None,
        material: Optional[str] = None,
        capacity_ml: Optional[Decimal] = None,
    ) -> None:

        if packaging_type is not None:
            self.packaging_type = packaging_type
        if material is not None:
            self.material = material
        if capacity_ml is not None:
            self.capacity_ml = capacity_ml
        self.updated_at = datetime.now()
        self._validate()
# ══════════════════════════════════════════════════════════════════════════════
# BOM ENTITY
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional

@dataclass
class BomLine:
    """
    Línea de la lista de materiales.
    Define un componente (item) que forma parte de la BOM,
    con su cantidad requerida expresada en la unidad base del item.
    """

    component_item_id:  int
    quantity:           float   # siempre en base_uom_id del item
    scrap_factor:       float

    # Identidad
    id: Optional[int] = None

    # ── Initialization & Validation ────────────────────────────────

    def __post_init__(self):
        self._validate()
    
    def _validate(self):
        if self.component_item_id is None:
            raise ValueError("component_item_id is required")

        if self.quantity is None or self.quantity <= 0:
            raise ValueError("quantity must be greater than 0")
        
        if self.scrap_factor is None or self.scrap_factor < 0:
            raise ValueError("scrap_factor cannot be negative")
        
        if self.scrap_factor >= 1:
            raise ValueError("scrap_factor must be less than 1 (0.05 for 5%)")
        
    # ── Business Rules ─────────────────────────────────────────────

    def effective_quantity(self) -> float:
        """
        Cantidad real requerida incluyendo la merma.
        Ej: 1000g con scrap_factor = 0.05 -> 1050g
        """
        return self.quantity * (1 + self.scrap_factor)

@dataclass
class Bom:
    """
    Define cómo un item se descompone en sus componentes.
    Un item puede tener múltiples versiones de BOM, pero solo una activa.
    """

    parent_item_id: int
    version:        int
    is_active:      bool
    valid_from:     date

    # Opcional
    created_at:     Optional[datetime] = None
    valid_to:       Optional[date] = None

    # Identidad
    id: Optional[int] = None

    # Líneas
    lines: list[BomLine] = field(default_factory=list)

    # ── Initialization & Validation ────────────────────────────────
    
    def __post_init__(self):
        self._validate()

    def _validate(self):
        if self.parent_item_id is None:
            raise ValueError("parent_item_id is required")

        if self.version is None or self.version <= 0:
            raise ValueError("version must be greater than 0")

        if self.valid_from is None:
            raise ValueError("valid_from is required")

        if self.valid_to is not None and self.valid_to <= self.valid_from:
            raise ValueError("valid_to must be greater than valid_from")

    # ── Line Management ────────────────────────────────────────────

    def add_line(self, component_item_id: int, quantity: float, scrap_factor: float = 0.0) -> BomLine:
        """
        Agrega una línea a la BOM.
        No permite duplicar el mismo componente.
        """
        if any(line.component_item_id == component_item_id for line in self.lines):
            raise ValueError(f"component_item_id={component_item_id} already exists in this BOM")
        
        line = BomLine(
            bom_id=self.id,
            component_item_id=component_item_id,
            quantity=quantity,
            scrap_factor=scrap_factor,
        )
        self.lines.append(line)
        return line
    
    def remove_line(self, component_item_id: int) -> None:
        """
        Elimina una línea de la BOM por component_item_id.
        """
        original_count = len(self.lines)
        self.lines = [line for line in self.lines if line.component_item_id != component_item_id]

        if len(self.lines) == original_count:
            raise ValueError(f"component_item_id={component_item_id} not found in this BOM")
        
    # ── State Transitions ──────────────────────────────────────────

    def activate(self) -> None:
        """Activa la BOM"""
        if self.is_active:
            raise ValueError("BOM is already active")
        self.is_active = True

    def deactivate(self) -> None:
        """Desactiva la BOM"""
        if not self.is_active:
            raise ValueError("BOM is already inactive")
        self.is_active = False

    # ── Business Rules ─────────────────────────────────────────────

    def is_valid_on(self, target_date: date) -> bool:
        """
        Verifica si la BOM está vigente en una fecha dada.
        """
        if target_date < self.valid_from:
            return False
        if self.valid_to is not None and target_date > self.valid_to:
            return False
        return True

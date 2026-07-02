# ══════════════════════════════════════════════════════════════════════════════
# UOM ENTITY
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from typing import Optional
from src.domain.value_objects.uom_type import UomType

@dataclass
class Uom:
    """
    Unidad de medida del sistema.

    Define cómo se expresan y convierten cantidades entre sí.
    Las UOM de tipo MASS y VOLUME tienen un factor_to_base que permite
    convertir a la unidad base de su tipo (ej: kg → mg).
    Las UOM de tipo UNIT (bolsa, cajón) tienen factor_to_base en None
    ya que su contenido varía por ítem o proveedor.
    """

    id: int = 0
    name: str
    symbol: str
    uom_type: UomType
    is_base: bool
    # Conversión
    factor_to_base: Optional[float] = None  # None para el tipo UNIT

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if not self.name or not self.name.strip():
            raise ValueError("name is required")

        if not self.symbol or not self.symbol.strip():
            raise ValueError("symbol is required")

        if self.uom_type != UomType.UNIT and self.factor_to_base is None:
            raise ValueError(f"factor_to_base is required for uom_type '{self.uom_type}'")

        if self.factor_to_base is not None and self.factor_to_base <= 0:
            raise ValueError("factor_to_base must be greater than 0")

        if self.is_base and self.uom_type == UomType.UNIT:
            raise ValueError("A UNIT type UOM cannot be marked as base")

        if self.is_base and self.factor_to_base is not None and self.factor_to_base != 1.0:
            raise ValueError("A base UOM must have factor_to_base = 1.0") # 1.0 == 1 en python
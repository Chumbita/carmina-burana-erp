# ══════════════════════════════════════════════════════════════════════════════
# SUPPLY ENTITY
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from src.domain.value_objects.supply_category import SupplyCategory

@dataclass
class Supply:
    """ 
    Entidad especializada de Item.
    """
    
    # Identidad
    item_id: int
    
    # Atributos esenciales
    supply_category: SupplyCategory
    
    # Metadatos
    created_at: datetime
    updated_at: Optional[datetime] = None

    
    # ── Initialization & Validation ────────────────────────────────
    
    def __post_init__(self):
        self._validate()

    def _validate(self):
        if self.item_id is None:
            raise ValueError("item_id is required")

        if not self.supply_category:
            raise ValueError("supply_category is required")

        if self.supply_category not in SupplyCategory.__members__.values():
            raise ValueError(f"Invalid supply_category: {self.supply_category}")
        
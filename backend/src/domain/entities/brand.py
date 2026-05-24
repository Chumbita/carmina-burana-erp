# ══════════════════════════════════════════════════════════════════════════════
# BRAND ENTITY
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from decimal import Decimal

@dataclass
class Brand:
    """
    Entidad marca (brand)
    """

    # Atributos esenciales
    name: str
    created_at: datetime

    # Identidad
    id: Optional[int] = None


# ── Initialization & Validation ────────────────────────────────

def __post_init__(self):
    self._validate()

def _validate(self):
    if not self.name or not self.name.strip():
        raise ValueError("'name' attribute is required")

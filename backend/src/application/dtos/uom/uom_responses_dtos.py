# ══════════════════════════════════════════════════════════════════════════════
# DTOs - RESPONSES DE UOM
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from typing import Optional

from src.domain.value_objects.uom_type import UomType

# ── DTO - List Uom Options ────────────────────────────────────────────────
@dataclass
class UomOptionResponseDTO:
    id: int
    name: str
    symbol: str


# ── DTO - Full Uom Response ──────────────────────────────────────────────
@dataclass
class UomResponse:
    id: int
    name: str
    symbol: str
    uom_type: UomType
    is_base: bool
    factor_to_base: Optional[float] = None

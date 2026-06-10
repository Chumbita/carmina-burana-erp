# ══════════════════════════════════════════════════════════════════════════════
# DTOs - RESPONSES DE UOM
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass

# ── DTO - List Uom Options ────────────────────────────────────────────────
@dataclass
class UomOptionResponseDTO:
    id: int
    name: str
    symbol: str

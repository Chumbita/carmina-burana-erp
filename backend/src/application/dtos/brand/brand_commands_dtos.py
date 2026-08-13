# ══════════════════════════════════════════════════════════════════════════════
# DTOs - COMMANDS DE BRAND
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass

# ── DTO - Create Brand ────────────────────────────────────────────────
@dataclass
class CreateBrandCommand:
    name: str


@dataclass
class UpdateBrandCommand:
    brand_id: int
    name: str

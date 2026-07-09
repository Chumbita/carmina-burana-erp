# ══════════════════════════════════════════════════════════════════════════════
# DTOs - COMMANDS DE BRAND
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass

# ── DTO - Create Brand ────────────────────────────────────────────────
@dataclass
class CreateBrandCommand:
    name: str

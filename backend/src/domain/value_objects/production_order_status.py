# ══════════════════════════════════════════════════════════════════════════════
# PRODUCTION ORDER STATUS
# ══════════════════════════════════════════════════════════════════════════════

from enum import Enum


class ProductionOrderStatus(str, Enum):
    PLANNED   = "PLANNED"
    DONE      = "DONE"
    CANCELLED = "CANCELLED"
    DISCARDED = "DISCARDED"

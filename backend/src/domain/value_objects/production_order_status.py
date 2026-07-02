# ══════════════════════════════════════════════════════════════════════════════
# PRODUCTION ORDER STATUS
# ══════════════════════════════════════════════════════════════════════════════

from enum import Enum


class ProductionOrderStatus(str, Enum):
    PLANNED     = "PLANNED"
    RELEASED    = "RELEASED"
    IN_PROGRESS = "IN_PROGRESS"
    DONE        = "DONE"
    CANCELLED   = "CANCELLED"
    DISCARDED   = "DISCARDED"
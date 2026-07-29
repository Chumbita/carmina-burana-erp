from enum import Enum


class LotStatus(str, Enum):
    ACTIVE = "active"
    DEPLETED = "depleted"
    EXPIRED = "expired"
    EXPIRING_SOON = "expiring_soon"

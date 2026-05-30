from enum import Enum


class SupplyEntryStatus(str, Enum):
    DRAFT = "DRAFT"
    CONFIRMED = "CONFIRMED"
    CANCELED = "CANCELED"

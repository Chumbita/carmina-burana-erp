from enum import Enum

class UomType(str, Enum):
    MASS   = "MASS"
    VOLUME = "VOLUME"
    UNIT   = "UNIT"
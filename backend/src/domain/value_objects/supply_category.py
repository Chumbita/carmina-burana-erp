from enum import Enum

class SupplyCategory(str, Enum):
    MALT = "MALT"
    HOPS = "HOPS"
    YEAST = "YEAST"
    WATER = "WATER"
    ADJUNCT = "ADJUNCT"         # Frutas, especias, azúcares
    CLARIFIER = "CLARIFIER"     # Irlandita, gelatina, etc
    GAS = "GAS"                 # CO2, nitrógeno
    CLEANING = "CLEANING"       # Sanitizantes
    OTHER = "OTHER"
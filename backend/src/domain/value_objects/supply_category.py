from enum import Enum

class SupplyCategory(str, Enum):
    MALT      = "Malta"
    HOPS      = "Lúpulos"
    YEAST     = "Levadura"
    WATER     = "Agua"
    ADJUNCT   = "Adjunto"       # Frutas, especias, azúcares
    CLARIFIER = "Clarificante"  # Irlandita, gelatina, etc
    GAS       = "Gas"           # CO2, nitrógeno
    CLEANING  = "Limpieza"      # Sanitizantes
    OTHER     = "Otro"
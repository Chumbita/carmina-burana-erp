from enum import Enum

class PackagingType(str, Enum):
    BOTTLE        = "Botella"
    CAN           = "Lata"
    BOX           = "Caja"
    KEG           = "Barril"
    LABEL         = "Etiqueta"
    CAP           = "Tapa"
    SIX_PACK_RING = "Pack"
    FILM          = "Film"
    BAG           = "Bolsa"
    OTHER         = "Otro"
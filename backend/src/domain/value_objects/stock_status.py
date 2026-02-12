from enum import Enum

class StockStatus(str, Enum):
    CRITICO = "critico"
    BAJO = "bajo"
    OPTIMO = "optimo"
    
    @classmethod
    def from_levels(cls, current: float, minimum: float) -> "StockStatus":
        if current < minimum:
            return cls.CRITICO
        elif current == minimum:
            return cls.BAJO
        return cls.OPTIMO

from dataclasses import dataclass
from typing import Optional

@dataclass
class Input:
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    unit: str = ""
    minimum_stock: float = 0
    image: Optional[str] = None
    status: bool = True

    def __post_init__(self):
        if self.minimum_stock < 0:
            raise ValueError("El stock mínimo no puede ser negativo")
        if not self.name.strip():
            raise ValueError("El nombre no puede estar vacío")

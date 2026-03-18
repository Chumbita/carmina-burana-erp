from dataclasses import dataclass

@dataclass
class ProductDTO:
    name: str
    type: str
    unit: str
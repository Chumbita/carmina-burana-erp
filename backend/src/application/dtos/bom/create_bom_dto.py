from typing import List
from dataclasses import dataclass
from src.application.dtos.bom.product_dto import ProductDTO
from src.application.dtos.bom.bom_item_dto import BomItemDTO

@dataclass
class CreateBomInputDTO:
    product: ProductDTO
    base_unit: str
    base_quantity: float
    standard_yield_pct: float
    items: List[BomItemDTO]
    
from dataclasses import dataclass
from typing import Optional

@dataclass
class BomItemDTO:
    component_type: str
    quantity: float
    input_id: Optional[int]= None
    product_id: Optional[int]= None
from dataclasses import dataclass

@dataclass
class BomItemDTO:
    component_type: str
    input_id: int
    product_id: int
    quantity: float
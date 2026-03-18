from pydantic import BaseModel
from typing import List, Optional, Any

# SCHEMAS AUXILIARES
class ProductSchema(BaseModel):
    name: str
    type: str
    unit: str
    
class BomItemSchema(BaseModel):
    component_type: str
    input_id: int
    product_id: int
    quantity: float

# SCHEMAS
class CreateBOMRequest(BaseModel):
    product: ProductSchema
    base_unit: str
    base_quantity: float
    standard_yield_pct: float
    items: List[BomItemSchema]
    
class CreateBOMResponse(BaseModel):
    success: bool
    data: Optional[Any]
    message: Optional[str]
from pydantic import BaseModel, Field
from src.domain.value_objects.supply_category import SupplyCategory


class CreateSupplyRequestSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    brand_id: int
    base_uom_id: int
    min_stock_level: float = Field(..., gt=0)
    is_batch_tracked: bool
    supply_category: SupplyCategory
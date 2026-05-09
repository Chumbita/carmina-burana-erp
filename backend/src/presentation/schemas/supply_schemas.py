from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal
from src.domain.value_objects.supply_category import SupplyCategory
from src.domain.value_objects.item_status_enums import ItemStatus

# ── REQUESTS ────────────────────────────────────────────────

class CreateSupplyRequestSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    brand_id: int
    base_uom_id: int
    min_stock_level: Decimal = Field(..., gt=0)
    supply_category: SupplyCategory


class UpdateSupplyRequestSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    brand_id: Optional[int] = None
    base_uom_id: Optional[int] = None
    min_stock_level: Optional[float] = Field(None, gt=0)
    is_manufacturable: Optional[bool] = None
    is_purchasable: Optional[bool] = None
    is_sellable: Optional[bool] = None
    supply_category: Optional[SupplyCategory] = None


# ── RESPONSES   ────────────────────────────────────────────────

class SupplyResponseSchema(BaseModel):
    # Datos del item base
    id: int
    name: str
    item_type_id: int
    brand_id: int
    base_uom_id: int
    is_stockable: bool
    is_batch_tracked: bool
    min_stock_level: Decimal
    is_manufacturable: bool
    is_purchasable: bool
    is_sellable: bool
    status: ItemStatus
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    
    # Datos específicos del supply
    supply_category: SupplyCategory
    
    class Config:
        from_attributes = True
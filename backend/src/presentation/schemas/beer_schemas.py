from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal
from src.domain.value_objects.item_status_enums import ItemStatus
from src.domain.value_objects.beer_style import BeerStyle


# ── REQUESTS ────────────────────────────────────────────────

class CreateBeerRequestSchema(BaseModel):
    """Schema para crear una cerveza."""
    # Item base
    name: str = Field(..., min_length=1, max_length=120)
    min_stock_level: Decimal = Field(..., ge=0)
    
    # Beer específico
    style: BeerStyle = Field(...)
    abv: float = Field(..., ge=0, le=100)
    ibu: int = Field(..., ge=0)
    fermentation_days: int = Field(..., gt=0)
    conditioning_days: int = Field(..., gt=0)


class UpdateBeerRequestSchema(BaseModel):
    """Schema para actualizar datos de cerveza (no item base)."""
    style: Optional[BeerStyle] = None
    abv: Optional[float] = Field(None, ge=0, le=100)
    ibu: Optional[int] = Field(None, ge=0)
    fermentation_days: Optional[int] = Field(None, gt=0)
    conditioning_days: Optional[int] = Field(None, gt=0)


# ── RESPONSES ────────────────────────────────────────────────

class BeerResponseSchema(BaseModel):
    """Schema para respuesta de cerveza (completo)."""
    # Datos del Item base
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
    
    # Datos específicos de Beer
    style: BeerStyle
    abv: float
    ibu: int
    fermentation_days: int
    conditioning_days: int
    beer_created_at: datetime
    beer_updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class BeerListResponseSchema(BaseModel):
    """Schema simplificado para listar cervezas."""
    id: int
    name: str
    brand_id: int
    style: BeerStyle
    abv: float
    ibu: int
    status: ItemStatus
    created_at: datetime
    
    class Config:
        from_attributes = True

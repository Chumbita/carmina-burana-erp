from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from src.domain.value_objects.packaging_type import PackagingType

# ── REQUESTS ────────────────────────────────────────────────

class CreatePackagingSupplyRequestSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    brand_id: int
    base_uom_id: int
    min_stock_level: Decimal = Field(..., gt=0)
    packaging_type: PackagingType
    material: str = Field(..., min_length=1)
    capacity_ml: Optional[Decimal] = None


class UpdatePackagingSupplyRequestSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    brand_id: Optional[int] = None
    base_uom_id: Optional[int] = None
    min_stock_level: Optional[float] = Field(None, gt=0)
    packaging_type: Optional[PackagingType] = None
    material: Optional[str] = Field(None, min_length=1)
    capacity_ml: Optional[Decimal] = None


# ── RESPONSES ────────────────────────────────────────────────

class PackagingSupplyResponseSchema(BaseModel):
    id: int
    name: str
    brand_name: str
    base_uom_symbol: str
    min_stock_level: Decimal
    packaging_type: PackagingType
    material: str
    capacity_ml: Optional[Decimal]

    class Config:
        from_attributes = True


class PackagingSupplyGeneralResponseSchema(BaseModel):
    id: int
    name: str
    brand_name: str
    base_uom_symbol: str
    min_stock_level: Decimal
    packaging_type: PackagingType
    material: str
    capacity_ml: Optional[Decimal] = None
    stock_total: float
    estado_stock: str


class PackagingSupplyInventoryBalanceSchema(BaseModel):
    quantity: float


class PackagingSupplyDetailResponseSchema(BaseModel):
    id: int
    name: str
    item_type: str
    brand: str
    base_uom_symbol: str
    min_stock_level: Decimal
    packaging_type: PackagingType
    material: str
    capacity_ml: Optional[Decimal] = None
    stock_total: float
    estado_stock: str
    created_at: datetime
    updated_at: datetime
    inventory_balance: list[PackagingSupplyInventoryBalanceSchema]
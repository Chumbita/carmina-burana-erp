from pydantic import BaseModel, Field
from datetime import date, datetime
from decimal import Decimal
from typing import Optional


# ── REQUESTS ────────────────────────────────────────────────

class CreateProductionOrderSchema(BaseModel):
    item_id: int
    bom_id: int
    planned_quantity: Decimal = Field(..., gt=0)
    schedule_date: date = Field(..., description="Fecha programada de producción obligatoria")
    description: Optional[str] = Field(None, max_length=255)


# ── RESPONSES ────────────────────────────────────────────────

class ProductionOrderResponseSchema(BaseModel):
    id: int
    item_id: int
    bom_id: int
    planned_quantity: Decimal
    produced_quantity: Decimal
    status: str
    schedule_date: Optional[date]
    description: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class ProductionOrderListResponseSchema(BaseModel):
    id: int
    item_name: str
    bom_version: str
    planned_quantity: Decimal
    base_uom_symbol: str
    schedule_date: datetime
    status: str

    class Config:
        from_attributes = True

class CompleteProductionOrderRequestSchema(BaseModel):
    """
    Schema para completar una orden de producción.
    Incluye los datos del lote de output que se genera al cerrar la orden.
    """
    produced_quantity: Decimal = Field(..., gt=0)
    lot_code: str = Field(..., min_length=1, max_length=100)
    unit_cost: Decimal = Field(..., gt=0)
    production_date: Optional[date] = None
    expiration_date: Optional[date] = None
 
    model_config = {
        "json_schema_extra": {
            "example": {
                "produced_quantity": 950,
                "lot_code": "IPA-2026-001",
                "unit_cost": 250.00,
                "production_date": "2026-07-15",
                "expiration_date": "2026-10-15"
            }
        }
    }
 

# ── RESPONSES BOM ─────────────────────────────────────────────

class BomLineDetailSchema(BaseModel):
    name: str
    quantity: Decimal
    uom: Optional[str] = None


class ItemBomSchema(BaseModel):
    id: int
    version: int
    quantity: Decimal
    uom: Optional[str] = None
    lines: list[BomLineDetailSchema]
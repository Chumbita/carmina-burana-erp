from pydantic import BaseModel, Field
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional


# ── REQUESTS ────────────────────────────────────────────────

class CreateProductionOrderSchema(BaseModel):
    item_id: int
    bom_id: int
    planned_quantity: Decimal = Field(..., gt=0)
    schedule_date: date = Field(..., description="Fecha programada de producción obligatoria")
    description: Optional[str] = Field(None, max_length=255)


class DiscardProductionOrderRequestSchema(BaseModel):
    description: Optional[str] = Field(None, max_length=255, description="Motivo breve del descarte")


class UpdateProductionOrderRequestSchema(BaseModel):
    """Mismas validaciones de creación para los campos editables."""
    planned_quantity: Optional[Decimal] = Field(None, gt=0, description="Cantidad a producir (debe ser > 0)")
    schedule_date: Optional[date] = Field(None, description="Fecha programada (requerida)")


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


class ProductionIngredientDetailSchema(BaseModel):
    """
    Insumo requerido por una orden de producción planificada.
    La cantidad está escalada a la cantidad planificada de la orden.
    """
    component_item_id: int
    component_item_name: str
    required_quantity: Decimal
    uom_id: Optional[int] = None
    uom_symbol: Optional[str] = None

    class Config:
        from_attributes = True


class ProductionConsumptionDetailSchema(BaseModel):
    id: int
    item_id: int
    item_name: str
    lot_id: int
    lot_code: str
    quantity: Decimal
    uom_symbol: Optional[str] = None

    class Config:
        from_attributes = True


class ProductionOutputDetailSchema(BaseModel):
    id: int
    item_id: int
    item_name: str
    lot_id: int
    lot_code: str
    quantity: Decimal
    uom_symbol: Optional[str] = None

    class Config:
        from_attributes = True


class ProductionOrderDetailSchema(BaseModel):
    """
    Detalle completo de una orden de producción, incluyendo header,
    consumptions y outputs con nombre de item, código de lote y unidad
    de medida. Para órdenes PLANNED incluye los insumos que la producción
    va a ocupar (cantidades escaladas) y el costo unitario estimado;
    para DONE/DISCARDED el costo unitario real del lote producido.
    """
    id: int
    item_id: int
    item_name: str
    bom_id: int
    bom_version: int
    planned_quantity: Decimal
    produced_quantity: Decimal
    status: str
    base_uom_symbol: str
    schedule_date: Optional[date]
    completed_at: Optional[datetime]
    description: Optional[str]
    created_at: datetime
    unit_cost: Decimal = Decimal("0")
    ingredients: List[ProductionIngredientDetailSchema] = []
    consumptions: List[ProductionConsumptionDetailSchema] = []
    outputs: List[ProductionOutputDetailSchema] = []

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
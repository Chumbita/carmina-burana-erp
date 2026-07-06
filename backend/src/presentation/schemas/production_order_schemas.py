from pydantic import BaseModel, Field
from datetime import date, datetime
from decimal import Decimal
from typing import Optional


class CreateProductionOrderSchema(BaseModel):
    item_id: int
    bom_id: int
    planned_quantity: Decimal = Field(..., gt=0)
    schedule_date: Optional[date] = None
    description: Optional[str] = Field(None, max_length=255)


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
        orm_mode = True

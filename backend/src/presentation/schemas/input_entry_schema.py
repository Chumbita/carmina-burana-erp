from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


# ── Request 

class InputEntryItemRequest(BaseModel):
    id_input: int
    amount: float = Field(gt=0, description="Debe ser mayor a cero")
    unit_cost: float = Field(ge=0, description="No puede ser negativo")
    expire_date: date
    comment: Optional[str] = None


class InputEntryRequest(BaseModel):
    entry_date: date
    supplier: str = Field(min_length=1)
    total_cost: float = Field(ge=0)
    description: Optional[str] = None
    items: list[InputEntryItemRequest] = Field(min_length=1)


# ── Response 

class InputInventoryResponse(BaseModel):
    id: int
    initial_amount: float
    current_amount: float
    expire_date: date

class InputEntryItemResponse(BaseModel):
    id: int
    id_input: int
    amount: float
    unit_cost: float
    expire_date: date
    comment: Optional[str] = None
    batch: InputInventoryResponse


class InputEntryResponse(BaseModel):
    id: int
    reception_number: str
    entry_date: date
    supplier: str
    total_cost: float
    description: Optional[str] = None
    created_at: datetime
    items: list[InputEntryItemResponse]
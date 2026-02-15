from pydantic import BaseModel
from decimal import Decimal

class InputResponse(BaseModel):
    id: int
    name: str
    brand: str
    category: str | None
    unit: str
    minimum_stock: Decimal
    stockTotal: float
    estadoStock: str
    image: str | None
    status: bool

    class Config:
        from_attributes = True

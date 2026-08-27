from decimal import Decimal
from pydantic import BaseModel, Field


class AdjustLotRequest(BaseModel):
    new_quantity: Decimal = Field(..., ge=0, decimal_places=4, max_digits=14, description="Cantidad física real contada")
    reason: str = Field(..., min_length=3, max_length=500, description="Motivo de la auditoría")


class AdjustLotResponse(BaseModel):
    item_id: int
    lot_id: int
    previous_quantity: Decimal
    new_quantity: Decimal
    delta: Decimal
    reserved_quantity: Decimal
    message: str = "Stock ajustado correctamente"

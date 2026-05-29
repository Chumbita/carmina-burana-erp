from pydantic import BaseModel
from datetime import datetime

#  # ── Schema de respuesta para las opcionse de uom ────────
class UomOptionResponse(BaseModel):
    id: int
    name: str
    symbol: str

    class Config:
        from_attributes = True

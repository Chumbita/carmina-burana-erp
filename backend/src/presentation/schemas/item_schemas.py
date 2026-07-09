# ══════════════════════════════════════════════════════════════════════════════
# SCHEMAS PYDANTIC - ITEM
# ══════════════════════════════════════════════════════════════════════════════

from pydantic import BaseModel


class ItemOptionResponse(BaseModel):
    item_id: int
    item_type: str
    name: str
    brand: str
    uom_id: int
    uom_symbol: str

    class Config:
        from_attributes = True

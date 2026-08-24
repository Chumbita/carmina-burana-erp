from pydantic import BaseModel

class ManufacturableItemSchema(BaseModel):
    id: int
    item_type: str
    name: str
    brand: str
    brand_id: int
    uom_symbol: str
    uom_id: int

    class Config:
        from_attributes = True
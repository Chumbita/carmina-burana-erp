from pydantic import BaseModel

class ManufacturableItemSchema(BaseModel):
    id: int
    name: str
    item_type_id: int

    class Config:
        from_attributes = True
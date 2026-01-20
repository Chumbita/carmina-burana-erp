from pydantic import BaseModel
from typing import Optional

class InputCreateSchema(BaseModel):
    name: str
    brand: Optional[str]
    category: Optional[str]
    unit: str
    minimum_stock: float
    image: Optional[str] = None
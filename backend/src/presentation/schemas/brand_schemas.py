from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CreateBrandRequest(BaseModel):
    name: str

class UpdateBrandRequest(CreateBrandRequest):
    pass

class BrandResponse(BaseModel):
    id: int
    name: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

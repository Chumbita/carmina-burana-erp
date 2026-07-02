from typing import Optional

from pydantic import BaseModel, Field

from src.domain.value_objects.uom_type import UomType


class UomOptionResponse(BaseModel):
    id: int
    name: str
    symbol: str

    class Config:
        from_attributes = True


class CreateUomRequest(BaseModel):
    name: str = Field(..., min_length=1)
    symbol: str = Field(..., min_length=1)
    uom_type: UomType
    is_base: bool = False
    factor_to_base: Optional[float] = None


class UomResponse(BaseModel):
    id: int
    name: str
    symbol: str
    uom_type: UomType
    is_base: bool
    factor_to_base: Optional[float] = None

    class Config:
        from_attributes = True

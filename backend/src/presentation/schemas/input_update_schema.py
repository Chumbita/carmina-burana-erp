from pydantic import BaseModel, field_validator
from typing import Optional
import re

class InputUpdateSchema(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    minimum_stock: Optional[float] = None
    image: Optional[str] = None

    @field_validator("name", "brand", "category", "unit")
    @classmethod
    def no_vacios(cls, value):
        if value is None:
            return value

        if not value.strip():
            raise ValueError("El campo no puede estar vacío o solo con espacios")

        if not re.match(r"^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ_\-.,]+$", value):
            raise ValueError("El campo contiene caracteres inválidos")

        return value

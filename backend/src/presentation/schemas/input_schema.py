from pydantic import BaseModel, field_validator
from typing import Optional
import re

class InputCreateSchema(BaseModel):
    name: str
    brand: str
    category: str
    unit: str
    minimum_stock: float
    image: Optional[str] = None

    @field_validator("name", "brand", "category", "unit")
    @classmethod
    def no_vacios(cls, value):
        if not value or not value.strip():
            raise ValueError("El campo no puede estar vacío o solo con espacios")

        # solo letras, números, espacios, guiones, punto y coma.
        if not re.match(r"^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ_\-.,]+$", value):
            raise ValueError("El campo contiene caracteres inválidos")

        return value
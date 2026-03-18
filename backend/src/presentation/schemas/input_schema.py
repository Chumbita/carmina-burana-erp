from pydantic import BaseModel, field_validator
from typing import Optional
import re

class InputCreateSchema(BaseModel):
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    unit: str
    minimum_stock: float = 0
    image: Optional[str] = None

    @field_validator("name", "unit")
    @classmethod
    def no_vacios(cls, value):
        if not value or not value.strip():
            raise ValueError("El campo no puede estar vacío o solo con espacios")

        # solo letras, números, espacios, guiones, punto y coma.
        if not re.match(r"^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ_\-.,]+$", value):
            raise ValueError("El campo contiene caracteres inválidos")

        return value

    @field_validator("brand", "category")
    @classmethod
    def opcionales(cls, value):
        if value is None:
            return None
        
        if not value.strip():
            return None
            
        # solo letras, números, espacios, guiones, punto y coma.
        if not re.match(r"^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ_\-.,]+$", value):
            raise ValueError("El campo contiene caracteres inválidos")

        return value
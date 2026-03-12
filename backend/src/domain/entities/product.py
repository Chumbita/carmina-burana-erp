from dataclasses import dataclass, field
from datetime import datetime

@dataclass 
class Product:
    id:int = field(default=None)
    name:str = field(default="")
    product_type:str = field(default="")
    unit:str = field(default="")
    is_active:bool = field(default=True)
    created_at:datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        allowed_types = {"BASE_BEER", "PACKAGED", "KEG"}
        if self.product_type not in allowed_types:
            raise ValueError(f"Campo product_type '{self.product_type}' inválido. Debe ser alguno de los siguientes {allowed_types}.")
        if not self.name.strip():
            raise ValueError(f"El campo name no puede estar vacío.")
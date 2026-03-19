from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class Bom:
    id:int = field(default=None)
    product_id:int = field(default=None)
    version:int = field(default=None)
    base_unit:str = field(default="")
    base_quantity:float = field(default=None)
    standard_yield_pct:float = field(default=None)
    is_active:bool = field(default=True)
    created_at:datetime = field(default_factory=datetime.now)
    items:list["BomItem"] = field(default_factory=list)
    
    def __post_init__(self):
        if self.standard_yield_pct <=0 or self.standard_yield_pct > 100:
            raise ValueError(f"Campo standard_yield_pct inválido. El rendimiento estándar debe estar entre 0 y 100.")
        
        if not self.items:
            raise ValueError("El BOM debe tener al menos un ítem.")
        
    def add_item(self, component_type:str, input_id:int | None, product_id:int | None, quantity:float):
        if quantity <= 0 :
            raise ValueError(f"Campo quantity inválid. La cantidad debe ser mayor a cero.")
        if any(item.input_id  == input_id for item in self.items) or any(item.product_id == product_id for item in self.items):
            raise ValueError(f"El componente ya existe en la lista de ítems del BOM.")
        
        new_item = BomItem(
            component_type=component_type,
            input_id=input_id,
            product_id=product_id,
            quantity=quantity
        )
        self.items.append(new_item)
    
    
@dataclass
class BomItem:
    id:int = field(default=None)
    component_type:str = field(default="")
    input_id:int = field(default=None)
    product_id:int = field(default=None)
    quantity:float = field(default=None)
    
    def __post_init__(self):
        allow_types = {"MATERIAL", "PRODUCT"}
        if not self.component_type in allow_types:
            raise ValueError(f"Campo component_type inválido. El tipo de producto debe ser alguno de los siguientes: {allow_types}.")
        
        if self.component_type == "MATERIAL":
            if self.input_id is None or self.product_id is not None:
                raise ValueError("Para ítems de tipo MATERIAL, 'input_id' debe tener valor y 'product_id' debe ser nulo.")
        elif self.component_type == "PRODUCT":
            if self.product_id is None or self.input_id is not None:
                raise ValueError("Para ítems de tipo PRODUCT, 'product_id' debe tener valor y 'input_id' debe ser nulo.")
            
        if self.quantity is None or self.quantity <= 0:
            raise ValueError("Campo 'quantity' inválido. La cantidad debe ser mayor que cero.")
    
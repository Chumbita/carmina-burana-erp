from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional

@dataclass
class InputInventory:
    id_entry_item: int
    id_input: int
    initial_amount: float
    current_amount: float
    unit_cost: float
    expire_date: date
    last_updated: Optional[datetime] = None
    id: Optional[int] = None

    def __post_init__(self):
        if self.initial_amount <= 0:
            raise ValueError("La cantidad inicial debe ser mayor a cero")
        if self.current_amount < 0:
            raise ValueError("La cantidad disponible no puede ser negativa")
        if self.current_amount > self.initial_amount:
            raise ValueError("La cantidad disponible no puede superar la cantidad inicial")
        if self.unit_cost < 0:
            raise ValueError("El costo unitario no puede ser negativo")

    def get_expiration_status(self) -> str:
        days_remaining = (self.expire_date - date.today()).days
        if days_remaining < 0:
            return "Vencido"
        if days_remaining < 7:
            return "Crítico"
        if days_remaining < 30:
            return "Próximo a vencer"
        return "Óptimo"
    
@dataclass
class InputEntryItem:
    id_entry: int
    id_input: int
    amount: float
    unit_cost: float
    expire_date: date
    comment: Optional[str] = None
    lote: Optional[InputInventory] = None
    id: Optional[int] = None

    def __post_init__(self):
        if self.amount <= 0:
            raise ValueError("La cantidad debe ser mayor a cero")
        if self.unit_cost < 0:
            raise ValueError("El costo no puede ser negativo")
        if self.expire_date < date.today():
            raise ValueError("La fecha de vencimiento no puede ser del pasado")

@dataclass
class InputEntry:
    entry_date: date
    supplier: str
    total_cost: float
    items: list[InputEntryItem] = field(default_factory=list)
    description: Optional[str] = None
    reception_number: Optional[str] = None
    created_at: Optional[datetime] = None
    id: Optional[int] = None

    def __post_init__(self):
        if not self.supplier.strip():
            raise ValueError("El proveedor no puede estar vacío")
        if self.total_cost < 0:
            raise ValueError("El costo total no puede ser negativo")
        if not self.items:
            raise ValueError("La recepción debe tener al menos un artículo")


# ══════════════════════════════════════════════════════════════════════════════
# INVENTORY LOT
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from typing import Optional
from datetime import datetime, timezone
from decimal import Decimal

@dataclass
class InventoryLot: 
    id: Optional[int] = None
    item_id: int
    lot_code: str
    unit_cost: Decimal
    created_at: datetime
    expiration_date: datetime | None = None
    production_date: datetime | None = None
    
    # Método que se ejecuta automáticamente luego de una instanciación.
    def __post_init__(self):
        self._validate()
     
        
    # --- Validaciones --------------------------------------------------
    def _validate(self):
        if not self.lot_code or not self.lot_code.strip():
            raise ValueError("lot_code is required")
        
        if self.unit_cost <= Decimal("0"):
            raise ValueError("unit_cost cannot be negative")
        
        if self.production_date and self.expiration_date:
            if self.production_date >= self.expiration_date:
                raise ValueError("The production date must be prior to the expiration date")
            
    
    # --- Método de fabricación ------------------------------------------
    
    @classmethod
    def create(
        cls,
        item_id: int,
        lot_code: str,
        unit_cost: Decimal,
        expiration_date: datetime | None = None,
        production_date: datetime | None = None,
    ) -> "InventoryLot":
        """
        Método de fábrica que centraliza la creación de lotes nuevos.
        """
        return cls(
            item_id=item_id,
            lot_code=lot_code.strip().upper(),
            unit_cost=unit_cost,
            expiration_date=expiration_date,
            production_date=production_date,
            created_at=datetime.now(timezone.utc),
        )
    
    
    # --- Utilidades --------------------------------------------------
    
    def is_expired(self, reference_date: datetime | None = None) -> bool:
        """
        Determina si el lote está vencido respecto a una fecha de referencia.
        Si no se pasa fecha, usa el momento actual (UTC).
        """
        
        if self.expiration_date is None:
            return False
        ref = reference_date or datetime.now(timezone.utc)
        
        return self.expiration_date <= ref
    

    def days_until_expiration(self, reference_date: datetime | None = None) -> int | None:
        """
        Retorna la cantidad de días hasta el vencimiento.
        Retorna None si el lote no tiene fecha de vencimiento.
        Retorna un número negativo si ya venció.
        """
        if self.expiration_date is None:
            return None
        ref = reference_date or datetime.now(timezone.utc)
        
        return (self.expiration_date - ref).days
    
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from decimal import Decimal

from src.domain.value_objects.item_status import ItemStatus

@dataclass
class Item:
    id: Optional[int] = None
    name: str
    item_type_id: int
    brand_id: int
    base_uom_id: int
    min_stock_level: float
    
    is_stockable: bool
    is_batch_tracked: bool
    is_manufacturable: bool
    is_purchasable: bool
    is_sellable: bool

    status: str = ItemStatus.ACTIVE
    created_at: datetime
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
        
    # Método que se ejecuta automáticamente luego de una instanciación.
    def __post_init__(self):
        self._validate()

    # ── Validaciones ────────────────────────────────────────────────

    def _validate(self):

        if not self.name or not self.name.strip():
            raise ValueError("Item name is required")

        if self.item_type_id is None:
            raise ValueError("item_type_id is required")

        if self.brand_id is None:
            raise ValueError("brand_id is required")

        if self.base_uom_id is None:
            raise ValueError("base_uom_id is required")

        if self.min_stock_level is None:
            raise ValueError("min_stock_level is required")

        if self.min_stock_level < 0:
            raise ValueError("min_stock_level cannot be negative")

        if self.status not in ("ACTIVE", "INACTIVE", "DELETED"):
            raise ValueError("Invalid status")

        if not self.is_stockable and self.is_batch_tracked:
            raise ValueError("Non-stockable item cannot be batch tracked")

   # ── Comportamiento ────────────────────────────────────────────────
   
    def update(self, **kwargs):
        """
        Update parcial del item
        """
        allowed_fields = {
            "name",
            "item_type_id",
            "brand_id",
            "base_uom_id",
            "min_stock_level",
            "is_stockable",
            "is_batch_tracked",
            "is_manufacturable",
            "is_purchasable",
            "is_sellable",
        }

        self._guard_not_deleted("update")
        
        for key, value in kwargs.items():
            if key in allowed_fields:
                setattr(self, key, value)

        self.updated_at = datetime.now()
        self._validate()

    def deactivate(self):
        """ACTIVE → INACTIVE. Suspende el ítem sin eliminarlo."""
        
        self._guard_not_deleted("deactivate")
        if self.status == ItemStatus.INACTIVE:
            raise ValueError("Item already inactive")

        self.status = ItemStatus.INACTIVE
        self.updated_at = datetime.now()

    def activate(self):
        """INACTIVE → ACTIVE. Reactiva el ítem."""
        
        self._guard_not_deleted("reactivate")
        if self.status == ItemStatus.ACTIVE:
            raise ValueError("Item already active")

        self.status = ItemStatus.ACTIVE
        self.updated_at = datetime.now()

    def soft_delete(self):
        """
        Cualquier estado → DELETED. Operación irreversible vía API.
        Preserva el registro para trazabilidad histórica.
        """
        
        self._guard_not_deleted("delete")
        if self.status == ItemStatus.DELETED:
            raise ValueError("Item already deleted")

        self.status = ItemStatus.DELETED
        self.deleted_at = datetime.now()
        self.updated_at = datetime.now()

    # ── Utilidades ────────────────────────────────────────────────

    def is_active(self) -> bool:
        return self.status == ItemStatus.ACTIVE
    
    def is_deleted(self) -> bool:
        return self.status == ItemStatus.DELETED

    def can_be_sold(self) -> bool:
        return self.is_sellable and self.is_active()

    def can_be_purchased(self) -> bool:
        return self.is_purchasable and self.is_active()

    def can_be_manufactured(self) -> bool:
        return self.is_manufacturable and self.is_active()
    
    # ── Guards ────────────────────────────────────────────────
    
    def _guard_not_deleted(self, operation: str) -> None:
        if self.is_deleted():
            raise ValueError(
                f"Cannot {operation} item with id={self.id}: item is already deleted."
            )
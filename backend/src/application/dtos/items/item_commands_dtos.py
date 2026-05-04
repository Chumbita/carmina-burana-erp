# ══════════════════════════════════════════════════════════════════════════════
# DTOs - COMMANDS DE ITEM
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from src.domain.value_objects.item_status_enums import ItemStatus

# --- Create Item -----------------------------------------------------
@dataclass
class CreateItemCommand:
    """
    Comando de creación. Siempre lleva datos del ítem base MÁS los datos
    del registro especializado en `specialized_data`.

    specialized_data:
        Diccionario de campos específicos del tipo de ítem.
        El implementador de SpecializedItemCreatorPort extrae
        los campos que necesita. El caso de uso core no lo interpreta.

    Invariante:
        specialized_data NUNCA debe estar vacío.
    """
    # Campos del ítem base
    name: str
    item_type_id: int
    brand_id: int
    base_uom_id: int
    is_stockable: bool
    is_batch_tracked: bool
    min_stock_level: Decimal
    is_manufacturable: bool
    is_purchasable: bool
    is_sellable: bool

    # Datos del registro especializado — obligatorio
    specialized_data: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.specialized_data:
            raise ValueError(
                "specialized_data cannot be empty. "
                "Item creation always requires a specialized record. "
            )


# --- Update Item -----------------------------------------------------
@dataclass
class UpdateItemCommand:
    """
    Comando de actualización parcial (semántica PATCH).
    Solo se actualizan los campos con valor distinto de None.
    """
    # Campos base de Item.
    item_id: int
    name: Optional[str] = None
    brand_id: Optional[int] = None
    base_uom_id: Optional[int] = None
    min_stock_level: Optional[Decimal] = None
    is_manufacturable: Optional[bool] = None
    is_purchasable: Optional[bool] = None
    is_sellable: Optional[bool] = None
    
    # Datos del registro especializado
    specialized_data: Optional[Dict[str, Any]] = None
    
    # Validación del DTO
    def __post_init__(self) -> None:
        base_fields = [
            self.name,
            self.brand_id,
            self.base_uom_id,
            self.min_stock_level,
            self.is_manufacturable,
            self.is_purchasable,
            self.is_sellable,
        ]
        all_empty = all(f is None for f in base_fields) and self.specialized_data is None
        if all_empty:
            raise ValueError("UpdateItemCommand requires at least one field to update. All fields were None.")
    
    # Utilidades
    @property
    def has_base_changes(self) -> bool:
        """
        True si hay al menos un campo base a actualizar.
        """
        return any([
            self.name is not None,
            self.brand_id is not None,
            self.base_uom_id is not None,
            self.min_stock_level is not None,
            self.is_manufacturable is not None,
            self.is_purchasable is not None,
            self.is_sellable is not None,
        ])
 
    @property
    def has_specialized_changes(self) -> bool:
        """
        True si hay datos especializados a delegar al servicio (SpecializedItemUpdater).
        """
        return self.specialized_data is not None


# --- Change Item Status -----------------------------------------------
@dataclass
class ChangeItemStatusCommand:
    """
    Comando dedicado exclusivamente a transiciones de estado.
    Separado de UpdateItemCommand para hacer explícita la intención.
    """
    item_id: int
    new_status: ItemStatus
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

    Nota: item_type_id y base flags como is_stockable / is_batch_tracked
    son inmutables post-creación porque impactan toda la cadena de
    trazabilidad del inventario.
    """
    item_id: int
    name: Optional[str] = None
    brand_id: Optional[int] = None
    base_uom_id: Optional[int] = None
    min_stock_level: Optional[Decimal] = None
    is_manufacturable: Optional[bool] = None
    is_purchasable: Optional[bool] = None
    is_sellable: Optional[bool] = None


# --- Change Item Status -----------------------------------------------
@dataclass
class ChangeItemStatusCommand:
    """
    Comando dedicado exclusivamente a transiciones de estado.
    Separado de UpdateItemCommand para hacer explícita la intención.
    """
    item_id: int
    new_status: ItemStatus
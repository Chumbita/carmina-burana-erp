from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from src.domain.value_objects.item_status import ItemStatus

# ── Comandos ──────────────────────────────────────────────────────

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


@dataclass
class ChangeItemStatusCommand:
    """
    Comando dedicado exclusivamente a transiciones de estado.
    Separado de UpdateItemCommand para hacer explícita la intención.
    """
    item_id: int
    new_status: ItemStatus


# ── Respuestas ──────────────────────────────────────────────────────

@dataclass
class ItemResponse:
    id: int
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
    status: ItemStatus
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    @classmethod
    def from_entity(cls, item) -> "ItemResponse":
        return cls(
            id=item.id,
            name=item.name,
            item_type_id=item.item_type_id,
            brand_id=item.brand_id,
            base_uom_id=item.base_uom_id,
            is_stockable=item.is_stockable,
            is_batch_tracked=item.is_batch_tracked,
            min_stock_level=item.min_stock_level,
            is_manufacturable=item.is_manufacturable,
            is_purchasable=item.is_purchasable,
            is_sellable=item.is_sellable,
            status=item.status,
            created_at=item.created_at,
            updated_at=item.updated_at,
            deleted_at=item.deleted_at,
        )

# ══════════════════════════════════════════════════════════════════════════════
# DTOs - RESPONSES DE ITEM
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any

from src.domain.value_objects.item_status_enums import ItemStatus


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

@dataclass
class UpdateItemResponse:
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

    specialized: Optional[Dict[str, Any]] = field(default=None)

    @classmethod
    def from_entity(
        cls,
        item,
        specialized: Optional[Dict[str, Any]] = None,
    ) -> "UpdateItemResponse":
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
            specialized=specialized,
        )
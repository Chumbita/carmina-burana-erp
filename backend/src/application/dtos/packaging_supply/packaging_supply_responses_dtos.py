# ══════════════════════════════════════════════════════════════════════════════
# DTOs - RESPONSES DE PACKAGING SUPPLY
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Optional

from src.domain.value_objects.item_status_enums import ItemStatus
from src.domain.value_objects.packaging_type import PackagingType


@dataclass
class PackagingSupplyResponse:
    # Campos de item
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

    # Campos propios de packaging supply
    packaging_type: PackagingType
    material: str
    capacity_ml: Optional[Decimal]

    @classmethod
    def from_entities(cls, item, packaging_supply) -> "PackagingSupplyResponse":
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
            packaging_type=packaging_supply.packaging_type,
            material=packaging_supply.material,
            capacity_ml=packaging_supply.capacity_ml,
        )
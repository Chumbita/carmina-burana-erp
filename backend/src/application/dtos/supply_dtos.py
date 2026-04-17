from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Optional

from src.domain.value_objects.supply_category import SupplyCategory
from src.domain.value_objects.item_status import ItemStatus


@dataclass
class SupplyDetail:
    """DTO para los detalles completos de un supply."""
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
    supply_category: SupplyCategory

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Optional, Protocol

from src.domain.entities.packaging_supply import PackagingSupply


@dataclass
class PackagingSupplyDetailData:
    id: int
    name: str
    brand_name: str
    base_uom_symbol: str
    min_stock_level: Decimal
    packaging_type: str
    material: str
    capacity_ml: Optional[Decimal] = None


class IPackagingSupplyRepository(Protocol):

    async def add(self, packaging_supply: PackagingSupply) -> None:
        ...

    async def save(self, packaging_supply: PackagingSupply) -> None:
        ...

    async def get_by_item_id(self, item_id: int) -> Optional[PackagingSupply]:
        ...

    async def get_creation_detail(self, item_id: int) -> Optional[PackagingSupplyDetailData]:
        ...
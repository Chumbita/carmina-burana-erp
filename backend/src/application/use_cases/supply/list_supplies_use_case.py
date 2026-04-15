"""
Caso de uso para listar todos los insumos.
"""
from typing import List
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Optional

from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.domain.repositories.supply_repository import ISupplyRepository
from src.domain.value_objects.supply_category import SupplyCategory
from src.domain.value_objects.item_status import ItemStatus


@dataclass
class SupplyListItem:
    """DTO para un item en la lista de supplies."""
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


class ListSuppliesUseCase:
    """Caso de uso para listar todos los insumos activos."""
    
    def __init__(
        self,
        item_repository: ItemRepository,
        supply_repository: ISupplyRepository,
    ) -> None:
        self._item_repository = item_repository
        self._supply_repository = supply_repository
    
    async def execute(self) -> List[SupplyListItem]:
        """
        Obtiene todos los insumos activos con sus datos completos.
        """
        # Obtener todos los items de tipo SUPPLY (item_type_id = 1)
        items = await self._item_repository.get_by_item_type(1)
        
        # Construir lista con datos de supply
        supplies = []
        for item in items:
            supply = await self._supply_repository.get_by_item_id(item.id)
            if supply:
                supplies.append(
                    SupplyListItem(
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
                        supply_category=supply.supply_category,
                    )
                )
        
        return supplies

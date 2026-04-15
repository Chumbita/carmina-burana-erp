"""
Caso de uso para actualizar un insumo.
"""
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.domain.repositories.supply_repository import ISupplyRepository
from src.domain.value_objects.supply_category import SupplyCategory
from src.domain.value_objects.item_status import ItemStatus
from src.application.use_cases.supply.get_supply_use_case import ItemNotFoundException, SupplyDetail


@dataclass
class UpdateSupplyCommand:
    """Comando para actualizar un supply."""
    supply_id: int
    name: Optional[str] = None
    brand_id: Optional[int] = None
    base_uom_id: Optional[int] = None
    min_stock_level: Optional[Decimal] = None
    supply_category: Optional[SupplyCategory] = None


class UpdateSupplyUseCase:
    """Caso de uso para actualizar un insumo."""
    
    def __init__(
        self,
        item_repository: ItemRepository,
        supply_repository: ISupplyRepository,
    ) -> None:
        self._item_repository = item_repository
        self._supply_repository = supply_repository
    
    async def execute(self, command: UpdateSupplyCommand) -> SupplyDetail:
        """
        Actualiza un insumo existente.
        
        Raises:
            ItemNotFoundException: Si el item no existe.
        """
        # Verificar que existe
        item = await self._item_repository.get_by_id(command.supply_id)
        if not item:
            raise ItemNotFoundException(f"Supply with id {command.supply_id} not found")
        
        # Actualizar item si hay cambios
        if command.name:
            item.name = command.name
        if command.brand_id:
            item.brand_id = command.brand_id
        if command.base_uom_id:
            item.base_uom_id = command.base_uom_id
        if command.min_stock_level:
            item.min_stock_level = command.min_stock_level
        
        item.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await self._item_repository.update(item)
        
        # Actualizar supply si hay cambio de categoría
        if command.supply_category:
            supply = await self._supply_repository.get_by_item_id(command.supply_id)
            if supply:
                supply.supply_category = command.supply_category
                supply.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
                await self._supply_repository.update(supply)
        
        # Obtener datos actualizados
        updated_item = await self._item_repository.get_by_id(command.supply_id)
        updated_supply = await self._supply_repository.get_by_item_id(command.supply_id)
        
        return SupplyDetail(
            id=updated_item.id,
            name=updated_item.name,
            item_type_id=updated_item.item_type_id,
            brand_id=updated_item.brand_id,
            base_uom_id=updated_item.base_uom_id,
            is_stockable=updated_item.is_stockable,
            is_batch_tracked=updated_item.is_batch_tracked,
            min_stock_level=updated_item.min_stock_level,
            is_manufacturable=updated_item.is_manufacturable,
            is_purchasable=updated_item.is_purchasable,
            is_sellable=updated_item.is_sellable,
            status=updated_item.status,
            created_at=updated_item.created_at,
            updated_at=updated_item.updated_at,
            deleted_at=updated_item.deleted_at,
            supply_category=updated_supply.supply_category,
        )

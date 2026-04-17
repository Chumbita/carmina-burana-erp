"""
Caso de uso para obtener un insumo por ID.
"""
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.domain.repositories.supply_repository import ISupplyRepository
from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.application.dtos.supply_dtos import SupplyDetail


class ItemNotFoundException(Exception):
    """Excepción cuando no se encuentra un item."""
    pass


class GetSupplyUseCase:
    """Caso de uso para obtener un insumo específico."""
    
    def __init__(
        self,
        item_repository: ItemRepository,
        supply_repository: ISupplyRepository,
    ) -> None:
        self._item_repository = item_repository
        self._supply_repository = supply_repository
    
    async def execute(self, supply_id: int) -> SupplyDetail:
        """
        Obtiene un insumo por su ID.
        
        Raises:
            ItemNotFoundException: Si el item no existe.
        """
        item = await self._item_repository.get_by_id(supply_id)
        if not item:
            raise ItemNotFoundException(f"Supply with id {supply_id} not found")
        
        supply = await self._supply_repository.get_by_item_id(item.id)
        if not supply:
            raise ItemNotFoundException(f"Supply data for item {supply_id} not found")
        
        return SupplyDetail(
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

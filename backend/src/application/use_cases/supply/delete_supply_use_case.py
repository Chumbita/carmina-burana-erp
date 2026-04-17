"""
Caso de uso para eliminar (soft delete) un insumo.
"""
from datetime import datetime, timezone

from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.application.use_cases.supply.get_supply_use_case import ItemNotFoundException


class DeleteSupplyUseCase:
    """Caso de uso para eliminar un insumo (soft delete)."""
    
    def __init__(self, item_repository: ItemRepository) -> None:
        self._item_repository = item_repository
    
    async def execute(self, supply_id: int) -> None:
        """
        Elimina un insumo (soft delete).
        
        Raises:
            ItemNotFoundException: Si el item no existe.
        """
        item = await self._item_repository.get_by_id(supply_id)
        if not item:
            raise ItemNotFoundException(f"Supply with id {supply_id} not found")
        
        # Ejecutar soft delete usando el método de la entidad
        item.soft_delete()
        await self._item_repository.save(item)

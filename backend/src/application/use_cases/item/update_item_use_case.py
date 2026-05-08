# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA LA ACTUALIZACIÓN DE UN ITEM Y/O ITEM ESPECIALIZADO
# ══════════════════════════════════════════════════════════════════════════════

from typing import Optional

from src.application.interfaces.specialized_item_updater import SpecializedItemUpdater
from src.application.dtos.items.item_commands_dtos import UpdateItemCommand
from src.application.dtos.items.item_responses_dtos import ItemResponse
from src.domain.repositories.item_repository import IItemRepostory
from src.domain.exceptions.item_exceptions import ItemNotFoundException, ItemAlreadyDeletedException, SpecializedItemUpdateException

class UpdateItemUseCase():
    def __init__(
        self,
        item_repository: IItemRepostory,
        specialized_updater: Optional[SpecializedItemUpdater] = None
    ):
        self._item_repository = item_repository
        self._specialized_updater= specialized_updater
    
    async def execute(self, command: UpdateItemCommand):
        """ 
        FLUJO:
        1. Verificar la existencia del item mediante ID.
        2. Verificar que el item se encuentre activo. Items con status=INACTIVE o DELETED rechazan la operación.
        3. Si hay campos bases, se aplican los cambios en la entidad. 
        4. Persistir los cambios en la base de datos (sin realizar commit).
        5. Si hay specialized_data con valores válidos y el puerto inyectado, se delega la actualización del registro especializado.
        6. Retornar Item + Specialized Item.
        """
        
        # Paso 1 y 2: verificar existencia y estado.
        item = await self._item_repository.get_by_id(command.item_id)
        
        if item is None:
            raise ItemNotFoundException(command.item_id)
        if item.is_deleted():
            raise ItemAlreadyDeletedException(command.item_id)
        
        # Paso 3: actualizar atributos de la entidad.
        if command.has_base_changes:
            item.update(**{
                k: v for k, v in {
                    "name": command.name,
                    "brand_id": command.brand_id,
                    "base_uom_id": command.base_uom_id,
                    "min_stock_level": command.min_stock_level,
                    "is_manufacturable": command.is_manufacturable,
                    "is_purchasable": command.is_purchasable,
                    "is_sellable": command.is_sellable,
                }.items() if v is not None
            })
        
        # Paso 4: persistir cambios de la entidad en la db.
        updated_item = await self._item_repository.save(item)
        
        # Paso 5: Delegar la actualización del item especializado
        if self._specialized_updater is not None and command.has_specialized_changes:
            try:
                await self._specialized_updater.update(
                    item_id=command.item_id,
                    specialized_data=command.specialized_data
                )
            except SpecializedItemUpdateException:
                raise
            
            except Exception as exc:
                raise SpecializedItemUpdateException(str(exc)) from exc
 
        return ItemResponse.from_entity(updated_item)
                
                
        
            
        
           
        
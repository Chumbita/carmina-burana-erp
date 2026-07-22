# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA LA ACTUALIZACIÓN DE UN ITEM Y/O ITEM ESPECIALIZADO
# ══════════════════════════════════════════════════════════════════════════════

from typing import Optional

from src.application.interfaces.specialized_item_updater import SpecializedItemUpdater
from src.application.dtos.items.item_commands_dtos import UpdateItemCommand
from src.application.dtos.items.item_responses_dtos import ItemResponse
from src.domain.repositories.item_repository import IItemRepostory
from src.domain.repositories.brand_repository import IBrandRepository
from src.domain.repositories.uom_repository import IUomRepository
from src.domain.exceptions.item_exceptions import ItemNotFoundException, ItemAlreadyDeletedException, SpecializedItemUpdateException
from src.domain.services.audit_log_service import AuditLogService

class UpdateItemUseCase():
    def __init__(
        self,
        item_repository: IItemRepostory,
        specialized_updater: Optional[SpecializedItemUpdater] = None,
        audit_log_service: Optional[AuditLogService] = None,
        brand_repository: Optional[IBrandRepository] = None,
        uom_repository: Optional[IUomRepository] = None,
    ):
        self._item_repository = item_repository
        self._specialized_updater = specialized_updater
        self._audit_log_service = audit_log_service
        self._brand_repository = brand_repository
        self._uom_repository = uom_repository
    
    async def execute(self, command: UpdateItemCommand, user_id: int | None = None):
        """ 
        FLUJO:
        1. Verificar la existencia del item mediante ID.
        2. Verificar que el item se encuentre activo. Items con status=INACTIVE o DELETED rechazan la operación.
        3. Si hay campos bases, se aplican los cambios en la entidad. 
        4. Persistir los cambios en la base de datos (sin realizar commit).
        5. Si hay specialized_data con valores válidos y el puerto inyectado, se delega la actualización del registro especializado.
        6. Registrar log de auditoría si el servicio está inyectado.
        7. Retornar Item + Specialized Item.
        """
        
        # Paso 1 y 2: verificar existencia y estado.
        item = await self._item_repository.get_by_id(command.item_id)
        
        if item is None:
            raise ItemNotFoundException(command.item_id)
        if item.is_deleted():
            raise ItemAlreadyDeletedException(command.item_id)
        
        # Capturar old_data antes de aplicar cambios
        old_data = self._extract_item_data(item)
        
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
        old_specialized = None
        if self._specialized_updater is not None and command.has_specialized_changes:
            try:
                old_specialized = await self._specialized_updater.update(
                    item_id=command.item_id,
                    specialized_data=command.specialized_data
                )
            except SpecializedItemUpdateException:
                raise
            
            except Exception as exc:
                raise SpecializedItemUpdateException(str(exc)) from exc
        
        # Paso 6: Registrar log de auditoría
        if self._audit_log_service is not None and (command.has_base_changes or command.has_specialized_changes):
            new_data = self._extract_item_data(updated_item)
            if old_specialized:
                old_data.update(old_specialized)
            if command.specialized_data:
                new_data.update(command.specialized_data)
            await self._enrich_audit_data(old_data, new_data)
            await self._audit_log_service.log_item_update(
                entity_id=command.item_id,
                old_data=old_data,
                new_data=new_data,
                user_id=user_id,
            )
        
        return ItemResponse.from_entity(updated_item)

    @staticmethod
    def _extract_item_data(item) -> dict:
        return {
            "name": item.name,
            "brand_id": item.brand_id,
            "base_uom_id": item.base_uom_id,
            "min_stock_level": float(item.min_stock_level) if item.min_stock_level else None,
            "status": item.status.value if hasattr(item.status, 'value') else str(item.status),
        }

    async def _enrich_audit_data(self, old_data: dict, new_data: dict) -> None:
        brand_ids = set()
        uom_ids = set()
        for d in (old_data, new_data):
            bid = d.get("brand_id")
            if bid is not None:
                brand_ids.add(bid)
            uid = d.get("base_uom_id")
            if uid is not None:
                uom_ids.add(uid)

        brand_names = {}
        if self._brand_repository:
            for bid in brand_ids:
                brand = await self._brand_repository.get_by_id(bid)
                brand_names[bid] = brand.name if brand else str(bid)

        uom_symbols = {}
        if self._uom_repository:
            for uid in uom_ids:
                symbol = await self._uom_repository.get_symbol_by_id(uid)
                uom_symbols[uid] = symbol if symbol else str(uid)

        for d in (old_data, new_data):
            if "brand_id" in d and d["brand_id"] in brand_names:
                d["brand_id"] = brand_names[d["brand_id"]]
            if "base_uom_id" in d and d["base_uom_id"] in uom_symbols:
                d["base_uom_id"] = uom_symbols[d["base_uom_id"]]
                
                
        
            
        
           
        
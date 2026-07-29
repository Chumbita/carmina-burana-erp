# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA LA CREACIÓN DE UN ITEM + ITEM ESPECIALIZADO
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime, timezone

from typing import Optional

from src.application.interfaces.specialized_item_creator_port import SpecializedItemCreatorPort
from src.application.dtos.items.item_commands_dtos import CreateItemCommand
from src.application.dtos.items.item_responses_dtos import ItemResponse
from src.domain.entities.item import Item
from src.domain.repositories.item_repository import IItemRepostory
from src.domain.repositories.brand_repository import IBrandRepository
from src.domain.repositories.uom_repository import IUomRepository
from src.domain.exceptions.item_exceptions import SpecializedItemCreationException
from src.domain.services.audit_log_service import AuditLogService

class CreateItemUseCase:
    """ 
    Caso de uso para crear un ítem base y su registro especializado
    en una única transacción.
    
    FLUJO:
        1. Construir la entidad Item (valida invariantes de dominio en __post_init__).
        2. Persistir el ítem base via ItemRepository.save() → obtiene item.id.
        3. Delegar la creación del registro especializado al port inyectado.
           Ambos pasos usan la misma AsyncSession → misma transacción.
        4. Retornar ItemResponse.
        
    REGLA FUNDAMENTAL:
    Este caso de uso NUNCA es llamado directamente desde un endpoint REST. Es llamado por casos de uso especializados:
    Cada uno instancia CreateItemUseCase con su propio SpecializedItemCreatorPort.
    """
    
    def __init__(
        self,
        item_repository: IItemRepostory,
        specialized_creator: SpecializedItemCreatorPort,
        audit_log_service: Optional[AuditLogService] = None,
        brand_repository: Optional[IBrandRepository] = None,
        uom_repository: Optional[IUomRepository] = None,
    ) -> None:
        self._item_repository = item_repository
        self._specialized_creator = specialized_creator
        self._audit_log_service = audit_log_service
        self._brand_repository = brand_repository
        self._uom_repository = uom_repository

    async def execute(self, command: CreateItemCommand, user_id: int | None = None) -> ItemResponse:
        # Paso 1: Construir entidad
        item = Item(
            name=command.name.strip(),
            item_type_id=command.item_type_id,
            brand_id=command.brand_id,
            base_uom_id=command.base_uom_id,
            is_stockable=command.is_stockable,
            is_batch_tracked=command.is_batch_tracked,
            min_stock_level=command.min_stock_level,
            is_manufacturable=command.is_manufacturable,
            is_purchasable=command.is_purchasable,
            is_sellable=command.is_sellable,
            created_at= datetime.now(timezone.utc).replace(tzinfo=None),
        )

        # Paso 2: Persistir ítem base (flush, sin commit todavía)
        saved_item = await self._item_repository.add(item)

        # Paso 3: Crear registro especializado en la misma transacción
        # Si lanza excepción, el rollback de get_db_session revierte todo.
        try:
            await self._specialized_creator.create(saved_item.id, command)
        except SpecializedItemCreationException:
            raise
        except Exception as exc:
            raise SpecializedItemCreationException(str(exc)) from exc

        # Paso 4: Registrar log de auditoría
        if self._audit_log_service is not None:
            new_data = {
                "name": saved_item.name,
                "brand_id": saved_item.brand_id,
                "base_uom_id": saved_item.base_uom_id,
                "min_stock_level": float(saved_item.min_stock_level) if saved_item.min_stock_level else None,
                "status": saved_item.status.value if hasattr(saved_item.status, 'value') else str(saved_item.status),
            }
            await self._resolve_audit_names(new_data)
            await self._audit_log_service.log_item_create(
                entity_id=saved_item.id,
                new_data=new_data,
                user_id=user_id,
            )

        return ItemResponse.from_entity(saved_item)

    async def _resolve_audit_names(self, data: dict) -> None:
        brand_id = data.get("brand_id")
        if brand_id is not None and self._brand_repository:
            brand = await self._brand_repository.get_by_id(brand_id)
            if brand:
                data["brand_id"] = brand.name

        uom_id = data.get("base_uom_id")
        if uom_id is not None and self._uom_repository:
            symbol = await self._uom_repository.get_symbol_by_id(uom_id)
            if symbol:
                data["base_uom_id"] = symbol
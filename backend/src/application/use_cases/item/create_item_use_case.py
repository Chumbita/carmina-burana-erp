from datetime import datetime, timezone

from src.application.dtos.item_dtos import CreateItemCommand, ItemResponse
from src.domain.entities.item import Item
from src.domain.repositories.item_repository import ItemRepository
from src.domain.ports.specialized_item_creator_port import SpecializedItemCreatorPort
from src.domain.exceptions.item_exceptions import SpecializedItemCreationException

class CreateItemUseCase:
    """ 
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
        item_repository: ItemRepository,
        specialized_creator: SpecializedItemCreatorPort,
    ) -> None:
        self._item_repository = item_repository
        self._specialized_creator = specialized_creator

    async def execute(self, command: CreateItemCommand) -> ItemResponse:
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
        saved_item = await self._item_repo.save(item)

        # Paso 3: Crear registro especializado en la misma transacción
        # Si lanza excepción, el rollback de get_db_session revierte todo.
        try:
            await self._specialized_creator.create(saved_item.id, command)
        except SpecializedItemCreationException:
            raise
        except Exception as exc:
            raise SpecializedItemCreationException(str(exc)) from exc

        return ItemResponse.from_entity(saved_item)

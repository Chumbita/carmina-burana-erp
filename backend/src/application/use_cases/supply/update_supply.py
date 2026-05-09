from src.application.dtos.items.item_commands_dtos import UpdateItemCommand
from src.application.dtos.supply.supply_response_dtos import SupplyResponse
from src.application.use_cases.item.update_item_use_case import UpdateItemUseCase
from src.domain.repositories.supply_repository import ISupplyRepository
from src.domain.exceptions.supply_exceptions import SupplyNotFoundException


class UpdateSupplyUseCase:

    def __init__(
        self,
        update_item_use_case: UpdateItemUseCase,
        supply_repository: ISupplyRepository,
    ) -> None:
        self._update_item_use_case = update_item_use_case
        self._supply_repository = supply_repository

    async def execute(self, command: UpdateItemCommand) -> SupplyResponse:
        # Paso 1: Delegar actualización del item y supply
        updated_item = await self._update_item_use_case.execute(command)

        # Paso 2: Traer el supply actualizado
        supply = await self._supply_repository.get_by_item_id(command.item_id)

        if supply is None:
            raise SupplyNotFoundException(command.item_id)

        return SupplyResponse.from_entities(updated_item, supply)
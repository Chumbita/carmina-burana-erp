from src.domain.entities.uom import Uom
from src.domain.repositories.uom_repository import IUomRepository
from src.application.dtos.uom.uom_commands_dtos import CreateUomCommand
from src.application.dtos.uom.uom_responses_dtos import UomResponse


class CreateUomUseCase:

    def __init__(self, uom_repo: IUomRepository) -> None:
        self._uom_repo = uom_repo

    async def execute(self, command: CreateUomCommand) -> UomResponse:
        uom = Uom(
            name=command.name,
            symbol=command.symbol,
            uom_type=command.uom_type,
            is_base=command.is_base,
            factor_to_base=command.factor_to_base,
        )

        uom = await self._uom_repo.add(uom)

        return UomResponse(
            id=uom.id,
            name=uom.name,
            symbol=uom.symbol,
            uom_type=uom.uom_type,
            is_base=uom.is_base,
            factor_to_base=uom.factor_to_base,
        )

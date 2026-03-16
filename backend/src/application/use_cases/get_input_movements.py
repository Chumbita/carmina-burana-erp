from typing import Sequence

from src.domain.entities.input_movement import InputMovement
from src.domain.repositories.i_movement_repository import IMovementRepository


class GetInputMovementsUseCase:
    def __init__(self, movement_repo: IMovementRepository):
        self._movement_repo = movement_repo

    async def execute(self, input_id: int) -> Sequence[InputMovement]:
        return await self._movement_repo.get_by_input_id(input_id)

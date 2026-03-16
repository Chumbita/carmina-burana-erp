from typing import Protocol, Sequence

from src.domain.entities.input_movement import InputMovement


class IMovementRepository(Protocol):
    async def save(self, movement: InputMovement) -> InputMovement: ...
    async def get_by_input_id(self, input_id: int) -> Sequence[InputMovement]: ...
    # No existe delete() ni update() — por diseño

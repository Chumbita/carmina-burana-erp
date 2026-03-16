from typing import Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.domain.entities.input_movement import InputMovement
from src.domain.repositories.i_movement_repository import IMovementRepository
from src.infrastructure.database.models.input_movement_model import InputMovementModel


class MovementRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def save(self, movement: InputMovement) -> InputMovement:
        db_model = InputMovementModel(
            id=movement.id,
            input_id=movement.input_id,
            event_type=movement.event_type,
            snapshot=movement.snapshot,
            occurred_at=movement.occurred_at,
            performed_by=movement.performed_by,
        )
        self._session.add(db_model)
        await self._session.flush()
        return movement

    async def get_by_input_id(self, input_id: int) -> Sequence[InputMovement]:
        stmt = (
            select(InputMovementModel)
            .where(InputMovementModel.input_id == input_id)
            .order_by(InputMovementModel.occurred_at.desc())
        )
        result = await self._session.execute(stmt)
        rows = result.scalars().all()
        return [self._to_domain(row) for row in rows]

    def _to_domain(self, model: InputMovementModel) -> InputMovement:
        return InputMovement(
            id=model.id,
            input_id=model.input_id,
            event_type=model.event_type,
            snapshot=model.snapshot,
            occurred_at=model.occurred_at,
            performed_by=model.performed_by,
        )

    # No existe delete() ni update() — por diseño

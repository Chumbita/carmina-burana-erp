from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from src.domain.entities.input_movement import InputMovement


class MovementResponse(BaseModel):
    id: int
    input_id: int
    event_type: str
    snapshot: dict
    occurred_at: datetime
    performed_by: Optional[str]

    @classmethod
    def from_domain(cls, movement: InputMovement) -> "MovementResponse":
        return cls(
            id=movement.id,
            input_id=movement.input_id,
            event_type=movement.event_type,
            snapshot=movement.snapshot,
            occurred_at=movement.occurred_at,
            performed_by=movement.performed_by,
        )

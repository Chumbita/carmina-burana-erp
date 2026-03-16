from datetime import datetime
from typing import Optional

from src.domain.entities.input_movement import InputMovement
from src.domain.repositories.i_movement_repository import IMovementRepository


class RecordInputMovementUseCase:
    def __init__(self, movement_repo: IMovementRepository):
        self._movement_repo = movement_repo

    async def execute(
        self,
        input_id: int,
        event_type: str,
        before: dict,
        after: dict,
        performed_by: Optional[str] = None,
    ) -> InputMovement:
        # Generate a simple ID (in a real implementation, this would be handled by the database)
        # For now, we'll use a timestamp-based approach
        import time
        movement_id = str(int(time.time() * 1000))  # Convert to string for database compatibility
        
        movement = InputMovement(
            id=movement_id,
            input_id=input_id,
            event_type=event_type,
            snapshot={"before": before, "after": after},
            occurred_at=datetime.utcnow(),
            performed_by=performed_by,
        )
        
        result = await self._movement_repo.save(movement)
        return result

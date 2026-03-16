from fastapi import HTTPException, status
from src.domain.entities.input import Input
from src.domain.repositories.input_repository import InputRepository
from src.application.use_cases.record_input_movement import RecordInputMovementUseCase

class CreateInputUseCase:

    def __init__(self, repository: InputRepository, movement_use_case: RecordInputMovementUseCase = None):
        self.repository = repository
        self._movement_use_case = movement_use_case

    async def execute(self, data: dict) -> Input:
        new_input = Input(**data)

        existing = await self.repository.find_by_identity(
            new_input.name,
            new_input.brand,
            new_input.category
        )

        if existing:
            if not existing.status:
                existing.status = True
                updated_input = await self.repository.reactivate(existing)
                # Record movement for reactivation
                if self._movement_use_case:
                    await self._movement_use_case.execute(
                        input_id=updated_input.id,
                        event_type="UPDATED",
                        before={"status": False},
                        after={"status": True},
                        performed_by=data.get("performed_by")
                    )
                return updated_input
            else:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe un insumo con ese nombre, marca y/o categoría"
                )

        created_input = await self.repository.create(new_input)
        # Record movement for creation
        if self._movement_use_case:
            await self._movement_use_case.execute(
                input_id=created_input.id,
                event_type="CREATED",
                before={},
                after=data,
                performed_by=data.get("performed_by")
            )
        return created_input
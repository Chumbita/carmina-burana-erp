from fastapi import HTTPException, status
from src.domain.entities.input import Input
from src.domain.repositories.input_repository import InputRepository

class CreateInputUseCase:

    def __init__(self, repository: InputRepository):
        self.repository = repository

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
                return await self.repository.reactivate(existing)
            else:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe un insumo con ese nombre, marca y/o categoría"
                )

        return await self.repository.create(new_input)
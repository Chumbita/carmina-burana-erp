from fastapi import HTTPException, status
from src.domain.entities.input import Input
from src.domain.repositories.input_repository import InputRepository

class CreateInputUseCase:

    def __init__(self, repository: InputRepository):
        self.repository = repository

    async def execute(self, data: dict) -> Input:
        existing = await self.repository.get_by_name(data["name"])

        if existing:
            if existing.status is False:
                for key, value in data.items():
                    setattr(existing, key, value)
                existing.status = True
                return await self.repository.update(existing)
            else:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe un insumo activo con ese nombre"
                )

        input = Input(**data)
        return await self.repository.create(input)
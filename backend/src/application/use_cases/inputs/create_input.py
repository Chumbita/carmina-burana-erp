from src.domain.entities.input import Input
from src.domain.repositories.input_repository import InputRepository

class CreateInputUseCase:

    def __init__(self, repository: InputRepository):
        self.repository = repository

    async def execute(self, data: dict) -> Input:

        if await self.repository.exists_by_name(data["name"]):
            raise ValueError("Ya existe un insumo con ese nombre")

        input = Input(**data)
        return await self.repository.create(input)
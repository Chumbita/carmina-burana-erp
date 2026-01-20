from src.domain.entities.input import Input
from src.domain.repositories.input_repository import InputRepository

class CreateInputUseCase:

    def __init__(self, repository: InputRepository):
        self.repository = repository

    async def execute(self, data: dict) -> Input:
        input = Input(**data)
        return await self.repository.create(input)
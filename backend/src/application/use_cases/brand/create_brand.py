from datetime import datetime, timezone

from src.domain.entities.brand import Brand
from src.domain.repositories.brand_repository import IBrandRepository
from src.application.dtos.brand.brand_commands_dtos import CreateBrandCommand


class CreateBrandUseCase:
    def __init__(self, brand_repo: IBrandRepository):
        self._brand_repo = brand_repo

    async def execute(self, command: CreateBrandCommand) -> Brand:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        brand = Brand(
            name=command.name,
            created_at=now,
        )
        return await self._brand_repo.add(brand)

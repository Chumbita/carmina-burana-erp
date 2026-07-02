from src.domain.repositories.brand_repository import IBrandRepository
from src.domain.exceptions.brand_exceptions import BrandNotFoundError


class DeleteBrandUseCase:
    def __init__(self, brand_repo: IBrandRepository):
        self._brand_repo = brand_repo

    async def execute(self, brand_id: int) -> None:
        deleted = await self._brand_repo.delete(brand_id)
        if not deleted:
            raise BrandNotFoundError(brand_id)

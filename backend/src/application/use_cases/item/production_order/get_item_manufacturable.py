from src.domain.repositories.item_repository import IItemRepostory
from src.domain.entities.item import Item


class GetManufacturableItemsUseCase:
    def __init__(self, item_repo: IItemRepostory) -> None:
        self._item_repo = item_repo

    async def execute(self) -> list[Item]:
        return await self._item_repo.get_manufacturable()
from src.domain.repositories.item_repository import IItemRepostory


class GetManufacturableItemsUseCase:
    def __init__(self, item_repo: IItemRepostory) -> None:
        self._item_repo = item_repo

    async def execute(self) -> list[dict]:
        return await self._item_repo.get_manufacturable()
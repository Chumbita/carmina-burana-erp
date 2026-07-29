from typing import Optional

from src.infrastructure.database.repositories.bom_repository import BomRepository


class GetItemBomUseCase:
    def __init__(self, item_repo: BomRepository) -> None:
        self._item_repo = item_repo

    async def execute(self, item_id: int) -> Optional[dict]:
        return await self._item_repo.get_bom_by_item(item_id)
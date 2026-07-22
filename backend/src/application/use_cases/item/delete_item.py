from src.domain.repositories.item_repository import IItemRepostory
from src.domain.exceptions.item_exceptions import ItemNotFoundException, ItemHasStockException


class DeleteItemUseCase:
    """
    Soft delete genérico de un item (supply, packaging_supply, etc.).
    Regla de negocio: no se puede eliminar si tiene stock > 0.
    """

    def __init__(self, item_repository: IItemRepostory) -> None:
        self._item_repository = item_repository

    async def execute(self, item_id: int) -> None:
        if await self._item_repository.has_stock(item_id):
            raise ItemHasStockException(item_id)

        deleted = await self._item_repository.soft_delete(item_id)

        if not deleted:
            raise ItemNotFoundException(item_id)

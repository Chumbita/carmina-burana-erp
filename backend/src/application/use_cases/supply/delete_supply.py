from src.domain.repositories.supply_repository import ISupplyRepository
from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.domain.exceptions.supply_exceptions import SupplyHasStockException


class DeleteSupplyUseCase:
    """
    Soft delete de un supply (item + supply).
    Regla de negocio: no se puede eliminar si tiene stock > 0.
    """

    def __init__(self, supply_repository: ISupplyRepository) -> None:
        self._supply_repository = supply_repository

    async def execute(self, item_id: int) -> None:
        # Regla de negocio: rechazar si tiene stock activo
        if await self._supply_repository.has_stock(item_id):
            raise SupplyHasStockException(item_id)

        # Soft delete (marca status=DELETED en item)
        deleted = await self._supply_repository.soft_delete(item_id)

        if not deleted:
            raise ItemNotFoundException(item_id)

from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.infrastructure.database.repositories.inventory_transaction_repository import InventoryTransactionRepository
from src.infrastructure.database.repositories.inventory_lot_repository import InventoryLotRepository
from src.infrastructure.database.repositories.supply_repository import SupplyRepository
from src.presentation.schemas.inventory_transaction_schemas import (
    TRANSACTION_LABELS,
    TransactionResponseSchema,
)


class ListSupplyTransactionsUseCase:
    def __init__(
        self,
        supply_repository: SupplyRepository,
        transaction_repository: InventoryTransactionRepository,
        lot_repository: InventoryLotRepository,
    ) -> None:
        self._supply_repository = supply_repository
        self._transaction_repository = transaction_repository
        self._lot_repository = lot_repository

    async def execute(self, item_id: int) -> list[dict]:
        supply = await self._supply_repository.get_by_item_id(item_id)
        if supply is None:
            raise ItemNotFoundException(item_id)

        transactions = await self._transaction_repository.list_by_item(item_id)
        if not transactions:
            return []

        # Obtiene todos los lot_code en una sola consulta mediante IN (ids)
        lot_ids = {txn.lot_id for txn in transactions}
        lots_list = await self._lot_repository.list_by_ids(list(lot_ids))
        lots = {lot.id: lot.lot_code for lot in lots_list}

        return [
            TransactionResponseSchema(
                id=txn.id,
                lot_id=txn.lot_id,
                lot_code=lots.get(txn.lot_id, ""),
                quantity=txn.quantity,
                transaction_type=txn.transaction_type,
                transaction_label=TRANSACTION_LABELS.get(
                    txn.transaction_type, txn.transaction_type
                ),
                reference_type=txn.reference_type,
                reference_id=txn.reference_id,
                created_at=txn.created_at,
            ).model_dump()
            for txn in transactions
        ]
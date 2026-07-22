from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.infrastructure.database.repositories.inventory_transaction_repository import InventoryTransactionRepository
from src.infrastructure.database.repositories.inventory_lot_repository import InventoryLotRepository
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.infrastructure.database.repositories.uom_repository import UomRepository
from src.presentation.schemas.inventory_transaction_schemas import (
    TRANSACTION_LABELS,
    TransactionResponseSchema,
)


class ListItemTransactionsUseCase:
    def __init__(
        self,
        item_repository: ItemRepository,
        transaction_repository: InventoryTransactionRepository,
        lot_repository: InventoryLotRepository,
        uom_repository: UomRepository,
    ) -> None:
        self._item_repository = item_repository
        self._transaction_repository = transaction_repository
        self._lot_repository = lot_repository
        self._uom_repository = uom_repository

    async def execute(self, item_id: int) -> list[dict]:
        item = await self._item_repository.get_by_id(item_id)
        if item is None:
            raise ItemNotFoundException(item_id)

        uom_symbol = (await self._uom_repository.get_symbol_by_id(item.base_uom_id)) or ""

        transactions = await self._transaction_repository.list_by_item(item_id)
        if not transactions:
            return []

        lot_ids = {txn.lot_id for txn in transactions}
        lots_list = await self._lot_repository.list_by_ids(list(lot_ids))
        lots = {lot.id: lot.lot_code for lot in lots_list}

        return [
            TransactionResponseSchema(
                id=txn.id,
                lot_id=txn.lot_id,
                lot_code=lots.get(txn.lot_id, ""),
                quantity=txn.quantity,
                uom_symbol=uom_symbol,
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
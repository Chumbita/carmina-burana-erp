from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.infrastructure.database.repositories.inventory_transaction_repository import InventoryTransactionRepository
from src.infrastructure.database.repositories.inventory_lot_repository import InventoryLotRepository
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.infrastructure.database.repositories.uom_repository import UomRepository
from src.presentation.schemas.inventory_transaction_schemas import (
    TRANSACTION_LABELS,
    TransactionResponseSchema,
)
from src.shared.pagination import Page, PaginationParams


class ListItemTransactionsUseCase:
    def __init__(
        self,
        item_repository: ItemRepository,
        transaction_repository: InventoryTransactionRepository,
        lot_repository: InventoryLotRepository,
        uom_repository: UomRepository,
        audit_log_repository=None,
    ) -> None:
        self._item_repository = item_repository
        self._transaction_repository = transaction_repository
        self._lot_repository = lot_repository
        self._uom_repository = uom_repository
        self._audit_log_repository = audit_log_repository  # deprecated: reason ahora vive en transaction.reason

    async def execute(
        self,
        item_id: int,
        params: PaginationParams,
    ) -> Page[dict]:
        item = await self._item_repository.get_by_id(item_id)
        if item is None:
            raise ItemNotFoundException(item_id)

        uom_symbol = (await self._uom_repository.get_symbol_by_id(item.base_uom_id)) or ""

        transactions, total = await self._transaction_repository.list_by_item(
            item_id,
            offset=params.offset,
            limit=params.limit,
        )
        if not transactions:
            return Page(items=[], total_items=0, params=params)

        lot_ids = {txn.lot_id for txn in transactions}
        lots_list = await self._lot_repository.list_by_ids(list(lot_ids))
        lots = {lot.id: lot.lot_code for lot in lots_list}

        return Page(
            items=[
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
                    reason=txn.reason,
                ).model_dump()
                for txn in transactions
            ],
            total_items=total,
            params=params,
        )
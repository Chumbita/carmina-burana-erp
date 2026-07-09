from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.infrastructure.database.repositories.inventory_transaction_repository import InventoryTransactionRepository
from src.infrastructure.database.repositories.inventory_lot_repository import InventoryLotRepository


def get_list_item_transactions_use_case(
    session: AsyncSession = Depends(get_db),
) -> "ListItemTransactionsUseCase":
    from src.application.use_cases.inventory.list_item_transactions import ListItemTransactionsUseCase

    item_repository = ItemRepository(session)
    transaction_repository = InventoryTransactionRepository(session)
    lot_repository = InventoryLotRepository(session)
    return ListItemTransactionsUseCase(item_repository, transaction_repository, lot_repository)
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.supply_entry_repository import SupplyEntryRepository
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.infrastructure.database.repositories.inventory_lot_repository import InventoryLotRepository
from src.infrastructure.database.repositories.inventory_balance_repository import InventoryBalanceRepository
from src.infrastructure.database.repositories.inventory_transaction_repository import InventoryTransactionRepository
from src.application.use_cases.supply_entry.create_supply_entry import CreateSupplyEntryUseCase


def get_create_supply_entry_use_case(
    session: AsyncSession = Depends(get_db),
) -> CreateSupplyEntryUseCase:
    supply_entry_repo = SupplyEntryRepository(session)
    item_repo = ItemRepository(session)
    lot_repo = InventoryLotRepository(session)
    balance_repo = InventoryBalanceRepository(session)
    txn_repo = InventoryTransactionRepository(session)

    return CreateSupplyEntryUseCase(
        supply_entry_repo=supply_entry_repo,
        item_repo=item_repo,
        lot_repo=lot_repo,
        balance_repo=balance_repo,
        txn_repo=txn_repo,
    )

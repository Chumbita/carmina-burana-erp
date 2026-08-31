from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.infrastructure.database.repositories.inventory_transaction_repository import InventoryTransactionRepository
from src.infrastructure.database.repositories.inventory_lot_repository import InventoryLotRepository
from src.infrastructure.database.repositories.inventory_balance_repository import InventoryBalanceRepository
from src.infrastructure.database.repositories.audit_log_repository import AuditLogRepository
from src.infrastructure.database.repositories.uom_repository import UomRepository
from src.infrastructure.database.repositories.inventory_dashboard_repository import InventoryDashboardRepository


def get_list_item_transactions_use_case(
    session: AsyncSession = Depends(get_db),
) -> "ListItemTransactionsUseCase":
    from src.application.use_cases.inventory.list_item_transactions import ListItemTransactionsUseCase

    item_repository = ItemRepository(session)
    transaction_repository = InventoryTransactionRepository(session)
    lot_repository = InventoryLotRepository(session)
    uom_repository = UomRepository(session)
    audit_log_repository = AuditLogRepository(session)
    return ListItemTransactionsUseCase(
        item_repository, transaction_repository, lot_repository, uom_repository, audit_log_repository
    )


def build_get_lots_by_item(
    session: AsyncSession = Depends(get_db),
) -> "GetLotsByItemUseCase":
    from src.application.use_cases.inventory.get_lots_by_item import GetLotsByItemUseCase

    lot_repo = InventoryLotRepository(session)
    return GetLotsByItemUseCase(lot_repo=lot_repo)


def get_inventory_dashboard_use_case(
    session: AsyncSession = Depends(get_db),
) -> "GetInventoryDashboardUseCase":
    from src.application.use_cases.inventory.get_inventory_dashboard import GetInventoryDashboardUseCase

    return GetInventoryDashboardUseCase(InventoryDashboardRepository(session))


def get_adjust_lot_quantity_use_case(
    session: AsyncSession = Depends(get_db),
) -> "AdjustLotQuantityUseCase":
    from src.application.use_cases.inventory.adjust_lot_quantity import AdjustLotQuantityUseCase

    return AdjustLotQuantityUseCase(
        lot_repository=InventoryLotRepository(session),
        balance_repository=InventoryBalanceRepository(session),
        transaction_repository=InventoryTransactionRepository(session),
        audit_log_repository=AuditLogRepository(session),
        item_repository=ItemRepository(session),
    )

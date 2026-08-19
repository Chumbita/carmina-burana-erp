from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.production_order_repository import ProductionOrderRepository
from src.infrastructure.database.repositories.bom_repository import BomRepository
from src.infrastructure.database.repositories.inventory_balance_repository import InventoryBalanceRepository
from src.infrastructure.database.repositories.inventory_lot_repository import InventoryLotRepository
from src.infrastructure.database.repositories.inventory_transaction_repository import InventoryTransactionRepository
from src.application.use_cases.production_order.plan_production_order import PlanProductionOrderUseCase
from src.application.use_cases.production_order.execute_production_order import ExecuteProductionOrderUseCase
from src.application.use_cases.inventory.inventory_movement_use_case import InventoryMovementUseCase
from src.application.use_cases.production_order.get_production_order import ListIncompleteProductionsUseCase
from src.domain.services.inventory_movement_service import InventoryDomainService


def _get_inventory_movement_use_case(session: AsyncSession) -> InventoryMovementUseCase:
    """Instancia interna reutilizada por los casos de uso de producción."""
    return InventoryMovementUseCase(
        lot_repository=InventoryLotRepository(session),
        balance_repository=InventoryBalanceRepository(session),
        transaction_repository=InventoryTransactionRepository(session),
        domain_service=InventoryDomainService(),
    )


def get_plan_production_order_use_case(
    session: AsyncSession = Depends(get_db),
) -> PlanProductionOrderUseCase:
    return PlanProductionOrderUseCase(
        production_order_repository=ProductionOrderRepository(session),
        bom_repository=BomRepository(session),
        balance_repository=InventoryBalanceRepository(session),
        lot_repository=InventoryLotRepository(session),
    )


def get_execute_production_order_use_case(
    session: AsyncSession = Depends(get_db),
) -> ExecuteProductionOrderUseCase:
    return ExecuteProductionOrderUseCase(
        production_order_repository=ProductionOrderRepository(session),
        bom_repository=BomRepository(session),
        lot_repository=InventoryLotRepository(session),
        balance_repository=InventoryBalanceRepository(session),
        inventory_movement_use_case=_get_inventory_movement_use_case(session),
    )


def get_list_incomplete_productions_use_case(
    session: AsyncSession = Depends(get_db),
) -> ListIncompleteProductionsUseCase:
    production_order_repository = ProductionOrderRepository(session)
    return ListIncompleteProductionsUseCase(
        production_order_repository=production_order_repository,
        bom_repository=BomRepository(session),
        balance_repository=InventoryBalanceRepository(session),
        lot_repository=InventoryLotRepository(session),
    )

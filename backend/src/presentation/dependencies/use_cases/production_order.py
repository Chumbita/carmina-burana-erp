from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.production_order_repository import ProductionOrderRepository
from src.infrastructure.database.repositories.bom_repository import BomRepository
from src.infrastructure.database.repositories.inventory_balance_repository import InventoryBalanceRepository
from src.infrastructure.database.repositories.inventory_lot_repository import InventoryLotRepository
from src.infrastructure.database.repositories.inventory_transaction_repository import InventoryTransactionRepository
from src.application.use_cases.production_order.create_production_order import CreateProductionOrderUseCase
from src.application.use_cases.production_order.release_production_order import ReleaseProductionOrderUseCase
from src.application.use_cases.production_order.start_production_order import StartProductionOrderUseCase
from src.application.use_cases.production_order.complete_production_order import CompleteProductionOrderUseCase
from src.application.use_cases.inventory.inventory_movement_use_case import InventoryMovementUseCase
from src.domain.services.inventory_movement_service import InventoryDomainService


def _get_inventory_movement_use_case(session: AsyncSession) -> InventoryMovementUseCase:
    """Instancia interna reutilizada por los casos de uso de producción."""
    return InventoryMovementUseCase(
        lot_repository=InventoryLotRepository(session),
        balance_repository=InventoryBalanceRepository(session),
        transaction_repository=InventoryTransactionRepository(session),
        domain_service=InventoryDomainService(),
    )

def get_create_production_order_use_case(
    session: AsyncSession = Depends(get_db),
) -> CreateProductionOrderUseCase:
    production_order_repository = ProductionOrderRepository(session)
    bom_repository = BomRepository(session)
    return CreateProductionOrderUseCase(production_order_repository, bom_repository)


def get_release_production_order_use_case(
    session: AsyncSession = Depends(get_db),
) -> ReleaseProductionOrderUseCase:
    production_order_repository = ProductionOrderRepository(session)
    bom_repository = BomRepository(session)
    balance_repository = InventoryBalanceRepository(session)
    lot_repository = InventoryLotRepository(session)
    return ReleaseProductionOrderUseCase(
        production_order_repository,
        bom_repository,
        balance_repository,
        lot_repository,
    )

def get_start_production_order_use_case(
    session: AsyncSession = Depends(get_db),
) -> StartProductionOrderUseCase:
    return StartProductionOrderUseCase(
        production_order_repository=ProductionOrderRepository(session),
        bom_repository=BomRepository(session),
        lot_repository=InventoryLotRepository(session),
        balance_repository=InventoryBalanceRepository(session),
        inventory_movement_use_case=_get_inventory_movement_use_case(session),
    )

def get_complete_production_order_use_case(
    session: AsyncSession = Depends(get_db),
) -> CompleteProductionOrderUseCase:
    return CompleteProductionOrderUseCase(
        production_order_repository=ProductionOrderRepository(session),
        inventory_movement_use_case=_get_inventory_movement_use_case(session),
    )
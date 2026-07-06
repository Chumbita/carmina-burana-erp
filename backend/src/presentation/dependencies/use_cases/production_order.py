from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.production_order_repository import ProductionOrderRepository
from src.infrastructure.database.repositories.bom_repository import BomRepository
from src.infrastructure.database.repositories.inventory_balance_repository import InventoryBalanceRepository
from src.application.use_cases.production_order.create_production_order import CreateProductionOrderUseCase
from src.application.use_cases.production_order.release_production_order import ReleaseProductionOrderUseCase


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
    return ReleaseProductionOrderUseCase(
        production_order_repository,
        bom_repository,
        balance_repository,
    )

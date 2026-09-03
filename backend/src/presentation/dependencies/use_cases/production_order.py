from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.audit_log_repository import AuditLogRepository
from src.infrastructure.database.repositories.production_order_repository import ProductionOrderRepository
from src.infrastructure.database.repositories.bom_repository import BomRepository
from src.infrastructure.database.repositories.inventory_balance_repository import InventoryBalanceRepository
from src.infrastructure.database.repositories.inventory_lot_repository import InventoryLotRepository
from src.infrastructure.database.repositories.inventory_transaction_repository import InventoryTransactionRepository
from src.application.use_cases.production_order.plan_production_order import PlanProductionOrderUseCase
from src.application.use_cases.production_order.execute_production_order import ExecuteProductionOrderUseCase
from src.application.use_cases.production_order.cancel_production_order import CancelProductionOrderUseCase
from src.application.use_cases.production_order.discard_production_order import DiscardProductionOrderUseCase
from src.application.use_cases.inventory.inventory_movement_use_case import InventoryMovementUseCase
from src.application.use_cases.production_order.get_production_order import (
    ListIncompleteProductionsUseCase,
    ListFinishedProductionsUseCase,
)
from src.application.use_cases.production_order.get_production_order_by_id_use_case import (
    GetProductionOrderByIdUseCase,
)
from src.application.use_cases.production_order.update_production_order import (
    UpdateProductionOrderUseCase,
)
from src.application.use_cases.audit_logs.record_audit_log import RecordAuditLogUseCase
from src.domain.services.audit_log_service import AuditLogService
from src.domain.services.inventory_movement_service import InventoryDomainService


def _build_audit_log_service(session: AsyncSession) -> AuditLogService:
    audit_log_repo = AuditLogRepository(session)
    record_use_case = RecordAuditLogUseCase(audit_log_repo)
    return AuditLogService(record_use_case)


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
        audit_log_service=_build_audit_log_service(session),
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
        audit_log_service=_build_audit_log_service(session),
    )


def get_cancel_production_order_use_case(
    session: AsyncSession = Depends(get_db),
) -> CancelProductionOrderUseCase:
    return CancelProductionOrderUseCase(
        production_order_repository=ProductionOrderRepository(session),
        bom_repository=BomRepository(session),
        balance_repository=InventoryBalanceRepository(session),
        lot_repository=InventoryLotRepository(session),
        transaction_repository=InventoryTransactionRepository(session),
        audit_log_service=_build_audit_log_service(session),
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


def get_list_finished_productions_use_case(
    session: AsyncSession = Depends(get_db),
) -> ListFinishedProductionsUseCase:
    production_order_repository = ProductionOrderRepository(session)
    return ListFinishedProductionsUseCase(
        production_order_repository=production_order_repository,
    )


def get_discard_production_order_use_case(
    session: AsyncSession = Depends(get_db),
) -> DiscardProductionOrderUseCase:
    return DiscardProductionOrderUseCase(
        production_order_repository=ProductionOrderRepository(session),
        balance_repository=InventoryBalanceRepository(session),
        inventory_movement_use_case=_get_inventory_movement_use_case(session),
        audit_log_service=_build_audit_log_service(session),
    )


def get_production_order_by_id_use_case(
    session: AsyncSession = Depends(get_db),
) -> GetProductionOrderByIdUseCase:
    production_order_repository = ProductionOrderRepository(session)
    return GetProductionOrderByIdUseCase(
        production_order_repository=production_order_repository,
        bom_repository=BomRepository(session),
        balance_repository=InventoryBalanceRepository(session),
        lot_repository=InventoryLotRepository(session),
    )


def get_update_production_order_use_case(
    session: AsyncSession = Depends(get_db),
) -> UpdateProductionOrderUseCase:
    return UpdateProductionOrderUseCase(
        production_order_repository=ProductionOrderRepository(session),
        bom_repository=BomRepository(session),
        balance_repository=InventoryBalanceRepository(session),
        lot_repository=InventoryLotRepository(session),
        transaction_repository=InventoryTransactionRepository(session),
        audit_log_service=_build_audit_log_service(session),
    )

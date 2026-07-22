from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db

from src.infrastructure.database.repositories.supply_repository import SupplyRepository
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.infrastructure.database.repositories.audit_log_repository import AuditLogRepository
from src.infrastructure.database.repositories.brand_repository import BrandRepository
from src.infrastructure.database.repositories.uom_repository import UomRepository

from src.application.use_cases.supply.create_supply import SupplyItemCreator
from src.application.use_cases.item.create_specialized_item import CreateItemUseCase

from src.application.use_cases.supply.supply_item_updater import SupplyItemUpdater
from src.application.use_cases.item.update_item_use_case import UpdateItemUseCase
from src.application.use_cases.supply.update_supply import UpdateSupplyUseCase

from src.application.use_cases.audit_logs.record_audit_log import RecordAuditLogUseCase
from src.domain.services.audit_log_service import AuditLogService

from src.application.use_cases.supply.read_supply import (
    GetActiveSupplyDetailUseCase,
    ListActiveSuppliesUseCase,
)

def _build_audit_log_service(session: AsyncSession) -> AuditLogService:
    audit_log_repo = AuditLogRepository(session)
    record_use_case = RecordAuditLogUseCase(audit_log_repo)
    return AuditLogService(record_use_case)


def get_create_supply_use_case(
    session: AsyncSession = Depends(get_db),
) -> CreateItemUseCase:
    item_repository = ItemRepository(session)
    supply_repository = SupplyRepository(session)
    supply_creator = SupplyItemCreator(supply_repository)
    audit_log_service = _build_audit_log_service(session)
    brand_repository = BrandRepository(session)
    uom_repository = UomRepository(session)
    return CreateItemUseCase(
        item_repository, supply_creator, audit_log_service,
        brand_repository, uom_repository,
    )


def get_supply_repository(
    session: AsyncSession = Depends(get_db),
) -> SupplyRepository:
    """Inyecta el repositorio de supply para obtener datos adicionales."""
    return SupplyRepository(session)


def get_update_supply_use_case(
    session: AsyncSession = Depends(get_db),
) -> UpdateSupplyUseCase:
    item_repository = ItemRepository(session)
    supply_repository = SupplyRepository(session)
    supply_updater = SupplyItemUpdater(supply_repository)
    audit_log_service = _build_audit_log_service(session)
    brand_repository = BrandRepository(session)
    uom_repository = UomRepository(session)
    update_item_use_case = UpdateItemUseCase(
        item_repository, supply_updater, audit_log_service,
        brand_repository, uom_repository,
    )
    return UpdateSupplyUseCase(update_item_use_case, supply_repository)


def get_list_active_supplies_use_case(
    supply_repository: SupplyRepository = Depends(get_supply_repository),
) -> ListActiveSuppliesUseCase:
    return ListActiveSuppliesUseCase(supply_repository)


def get_active_supply_detail_use_case(
    supply_repository: SupplyRepository = Depends(get_supply_repository),
) -> GetActiveSupplyDetailUseCase:
    return GetActiveSupplyDetailUseCase(supply_repository)


def get_item_repository(
    session: AsyncSession = Depends(get_db),
) -> ItemRepository:
    return ItemRepository(session)


def get_delete_supply_use_case(
    supply_repository: SupplyRepository = Depends(get_supply_repository),
) -> "DeleteSupplyUseCase":
    from src.application.use_cases.supply.delete_supply import DeleteSupplyUseCase
    return DeleteSupplyUseCase(supply_repository)




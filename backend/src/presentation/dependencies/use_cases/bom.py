# ══════════════════════════════════════════════════════════════════════════════
# DEPENDENCIES - CASOS DE USO DE BOM
# ══════════════════════════════════════════════════════════════════════════════

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.application.use_cases.audit_logs.record_audit_log import RecordAuditLogUseCase
from src.application.use_cases.bom.create_bom_use_case import CreateBomUseCase
from src.application.use_cases.bom.get_bom_by_id_use_case import GetBomByIdUseCase
from src.application.use_cases.bom.get_item_bom_use_case import GetItemBomUseCase
from src.application.use_cases.bom.list_active_boms_use_case import (
    ListActiveBomsUseCase,
)
from src.domain.services.audit_log_service import AuditLogService
from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.audit_log_repository import (
    AuditLogRepository,
)
from src.infrastructure.database.repositories.bom_repository import BomRepository
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.infrastructure.database.repositories.uom_repository import UomRepository


def _build_audit_log_service(session: AsyncSession) -> AuditLogService:
    audit_log_repo = AuditLogRepository(session)
    record_use_case = RecordAuditLogUseCase(audit_log_repo)
    return AuditLogService(record_use_case)


def get_create_bom_use_case(
    session: AsyncSession = Depends(get_db),
) -> CreateBomUseCase:
    """
    Fábrica que instancia CreateBomUseCase con los repositorios de BOM, Item, UOM y auditoría.
    """
    bom_repository = BomRepository(session)
    item_repository = ItemRepository(session)
    uom_repository = UomRepository(session)
    audit_log_service = _build_audit_log_service(session)
    return CreateBomUseCase(
        bom_repository, item_repository, uom_repository, audit_log_service
    )


def get_list_active_boms_use_case(
    session: AsyncSession = Depends(get_db),
) -> ListActiveBomsUseCase:
    """
    Fábrica que instancia ListActiveBomsUseCase con el repositorio de BOM.
    """
    bom_repository = BomRepository(session)
    return ListActiveBomsUseCase(bom_repository)


def get_bom_by_id_use_case(
    session: AsyncSession = Depends(get_db),
) -> GetBomByIdUseCase:
    """
    Fábrica que instancia GetBomByIdUseCase con el repositorio de BOM.
    """
    bom_repository = BomRepository(session)
    return GetBomByIdUseCase(bom_repository)


def get_item_bom_use_case(
    session: AsyncSession = Depends(get_db),
) -> GetItemBomUseCase:
    """
    Fábrica que instancia GetItemBomUseCase con el repositorio de BOM.
    """
    bom_repository = BomRepository(session)
    return GetItemBomUseCase(bom_repository)

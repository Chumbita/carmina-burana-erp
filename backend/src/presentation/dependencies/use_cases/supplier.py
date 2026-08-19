from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.audit_log_repository import AuditLogRepository
from src.infrastructure.database.repositories.supplier_repository import SupplierRepository
from src.application.use_cases.audit_logs.record_audit_log import RecordAuditLogUseCase
from src.application.use_cases.supplier.create_supplier import CreateSupplierUseCase
from src.application.use_cases.supplier.get_supplier_by_name import GetSupplierByNameUseCase
from src.application.use_cases.supplier.list_supplier_options import ListSupplierOptionsUseCase
from src.application.use_cases.supplier.manage_supplier import (
    DeactivateSupplierUseCase,
    GetSupplierByIdUseCase,
    ListSuppliersUseCase,
    UpdateSupplierUseCase,
)
from src.domain.services.audit_log_service import AuditLogService


def _build_audit_log_service(session: AsyncSession) -> AuditLogService:
    audit_log_repo = AuditLogRepository(session)
    record_use_case = RecordAuditLogUseCase(audit_log_repo)
    return AuditLogService(record_use_case)


def build_create_supplier_use_case(
    session: AsyncSession = Depends(get_db),
) -> CreateSupplierUseCase:
    supplier_repo = SupplierRepository(session)
    return CreateSupplierUseCase(
        supplier_repo=supplier_repo,
        audit_log_service=_build_audit_log_service(session),
    )


def build_get_supplier_by_name_use_case(
    session: AsyncSession = Depends(get_db),
) -> GetSupplierByNameUseCase:
    supplier_repo = SupplierRepository(session)
    return GetSupplierByNameUseCase(supplier_repo=supplier_repo)


def build_list_supplier_options_use_case(
    session: AsyncSession = Depends(get_db),
) -> ListSupplierOptionsUseCase:
    supplier_repo = SupplierRepository(session)
    return ListSupplierOptionsUseCase(supplier_repo=supplier_repo)


def build_list_suppliers_use_case(
    session: AsyncSession = Depends(get_db),
) -> ListSuppliersUseCase:
    supplier_repo = SupplierRepository(session)
    return ListSuppliersUseCase(supplier_repo=supplier_repo)


def build_get_supplier_by_id_use_case(
    session: AsyncSession = Depends(get_db),
) -> GetSupplierByIdUseCase:
    supplier_repo = SupplierRepository(session)
    return GetSupplierByIdUseCase(supplier_repo=supplier_repo)


def build_update_supplier_use_case(
    session: AsyncSession = Depends(get_db),
) -> UpdateSupplierUseCase:
    supplier_repo = SupplierRepository(session)
    return UpdateSupplierUseCase(
        supplier_repo=supplier_repo,
        audit_log_service=_build_audit_log_service(session),
    )


def build_deactivate_supplier_use_case(
    session: AsyncSession = Depends(get_db),
) -> DeactivateSupplierUseCase:
    supplier_repo = SupplierRepository(session)
    return DeactivateSupplierUseCase(
        supplier_repo=supplier_repo,
        audit_log_service=_build_audit_log_service(session),
    )

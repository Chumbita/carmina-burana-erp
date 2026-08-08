# ══════════════════════════════════════════════════════════════════════════════
# BRAND USE CASE FACTORY
# ══════════════════════════════════════════════════════════════════════════════

from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from src.application.use_cases.audit_logs.record_audit_log import RecordAuditLogUseCase
from src.application.use_cases.brand.get_all_brands_use_case import GetAllBrandsUseCase
from src.application.use_cases.brand.create_brand import CreateBrandUseCase
from src.application.use_cases.brand.manage_brand import (
    DeactivateBrandUseCase,
    GetBrandByIdUseCase,
    UpdateBrandUseCase,
)
from src.domain.repositories.brand_repository import IBrandRepository
from src.domain.services.audit_log_service import AuditLogService
from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.audit_log_repository import AuditLogRepository
from src.infrastructure.database.repositories.brand_repository import BrandRepository
from src.presentation.dependencies.repositories import get_brand_respository


def _build_audit_log_service(session: AsyncSession) -> AuditLogService:
    audit_log_repo = AuditLogRepository(session)
    record_use_case = RecordAuditLogUseCase(audit_log_repo)
    return AuditLogService(record_use_case)

# ── GET ALL BRANDS ────────────────────────────────────────────────
def get_all_brands_use_case(
    repository: IBrandRepository = Depends(get_brand_respository)
) -> GetAllBrandsUseCase:
    return GetAllBrandsUseCase(repository)

# ── CREATE BRAND ────────────────────────────────────────────────
def get_create_brand_use_case(
    session: AsyncSession = Depends(get_db),
) -> CreateBrandUseCase:
    repository = BrandRepository(session)
    return CreateBrandUseCase(repository, _build_audit_log_service(session))


def get_brand_by_id_use_case(
    repository: IBrandRepository = Depends(get_brand_respository)
) -> GetBrandByIdUseCase:
    return GetBrandByIdUseCase(repository)


def get_update_brand_use_case(
    session: AsyncSession = Depends(get_db),
) -> UpdateBrandUseCase:
    repository = BrandRepository(session)
    return UpdateBrandUseCase(repository, _build_audit_log_service(session))


def get_deactivate_brand_use_case(
    session: AsyncSession = Depends(get_db),
) -> DeactivateBrandUseCase:
    repository = BrandRepository(session)
    return DeactivateBrandUseCase(repository, _build_audit_log_service(session))

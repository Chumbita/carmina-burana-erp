from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.use_cases.get_entity_audit_logs import GetEntityAuditLogsUseCase
from src.application.use_cases.get_user_audit_logs import GetUserAuditLogsUseCase
from src.application.use_cases.record_audit_log import RecordAuditLogUseCase
from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.audit_log_repository import AuditLogRepository


def get_audit_log_repo(db: AsyncSession = Depends(get_db)) -> AuditLogRepository:
    return AuditLogRepository(db)


def get_record_audit_log_use_case(
    repo: AuditLogRepository = Depends(get_audit_log_repo),
) -> RecordAuditLogUseCase:
    return RecordAuditLogUseCase(repo)


def get_entity_audit_logs_use_case(
    repo: AuditLogRepository = Depends(get_audit_log_repo),
) -> GetEntityAuditLogsUseCase:
    return GetEntityAuditLogsUseCase(repo)


def get_user_audit_logs_use_case(
    repo: AuditLogRepository = Depends(get_audit_log_repo),
) -> GetUserAuditLogsUseCase:
    return GetUserAuditLogsUseCase(repo)

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.input_repository_impl import (InputRepositoryImpl)
from src.application.use_cases.inputs.create_input import CreateInputUseCase
from src.application.use_cases.inputs.delete_input import DeleteInputUseCase
from src.application.use_cases.inputs.update_input import UpdateInputUseCase
from src.application.use_cases.inputs.list_input import GetActiveInputsUseCase
from src.application.use_cases.inputs.list_input import GetInputDetailUseCase
from src.application.use_cases.record_audit_log import RecordAuditLogUseCase
from src.application.use_cases.get_entity_audit_logs import GetEntityAuditLogsUseCase
from src.application.use_cases.get_user_audit_logs import GetUserAuditLogsUseCase
from src.infrastructure.database.repositories.audit_log_repository import AuditLogRepository

def get_create_input_use_case(
        db: AsyncSession = Depends(get_db)
) -> CreateInputUseCase:
    """
    Fábrica del caso de uso CreateInputUseCase.
    Acá se construyen las dependencias concretas.
    """
    repository = InputRepositoryImpl(db)
    audit_log_repo = AuditLogRepository(db)
    audit_log_use_case = RecordAuditLogUseCase(audit_log_repo)
    return CreateInputUseCase(repository, audit_log_use_case)

def get_delete_input_use_case(
        db: AsyncSession = Depends(get_db)
) -> DeleteInputUseCase:
    repository = InputRepositoryImpl(db)
    return DeleteInputUseCase(repository)

def get_active_inputs_use_case(
        db: AsyncSession = Depends(get_db)
) -> GetActiveInputsUseCase:
    repository = InputRepositoryImpl(db)
    return GetActiveInputsUseCase(repository)

def get_update_inputs_use_case(
        db: AsyncSession = Depends(get_db)
) -> UpdateInputUseCase:
    repository = InputRepositoryImpl(db)
    audit_log_repo = AuditLogRepository(db)
    audit_log_use_case = RecordAuditLogUseCase(audit_log_repo)
    return UpdateInputUseCase(repository, audit_log_use_case)
def get_inputs_detail_use_case(
        db: AsyncSession = Depends(get_db)
) -> GetInputDetailUseCase:
    repository = InputRepositoryImpl(db)
    return GetInputDetailUseCase(repository)

def get_entity_audit_logs_use_case(
    db: AsyncSession = Depends(get_db)
) -> GetEntityAuditLogsUseCase:
    audit_log_repo = AuditLogRepository(db)
    return GetEntityAuditLogsUseCase(audit_log_repo)

def get_user_audit_logs_use_case(
    db: AsyncSession = Depends(get_db)
) -> GetUserAuditLogsUseCase:
    audit_log_repo = AuditLogRepository(db)
    return GetUserAuditLogsUseCase(audit_log_repo)

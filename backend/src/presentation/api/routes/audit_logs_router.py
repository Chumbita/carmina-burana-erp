from fastapi import APIRouter, Depends

from src.application.use_cases.audit_logs.get_entity_audit_logs import GetEntityAuditLogsUseCase
from src.application.use_cases.audit_logs.get_user_audit_logs import GetUserAuditLogsUseCase
from src.presentation.dependencies.audit_log_deps import (
    get_entity_audit_logs_use_case,
    get_user_audit_logs_use_case,
)
from src.presentation.schemas.audit_log_schemas import AuditLogResponse

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("/{entity_type}/{entity_id}", response_model=list[AuditLogResponse])
async def get_entity_audit_logs(
    entity_type: str,
    entity_id: int,
    use_case: GetEntityAuditLogsUseCase = Depends(get_entity_audit_logs_use_case),
):
    logs = await use_case.execute(entity_type, entity_id)
    return [AuditLogResponse.from_domain(log) for log in logs]


@router.get("/user/{user_id}", response_model=list[AuditLogResponse])
async def get_user_audit_logs(
    user_id: int,
    use_case: GetUserAuditLogsUseCase = Depends(get_user_audit_logs_use_case),
):
    logs = await use_case.execute(user_id)
    return [AuditLogResponse.from_domain(log) for log in logs]

# Solo existen GET — no hay DELETE ni PUT en este router

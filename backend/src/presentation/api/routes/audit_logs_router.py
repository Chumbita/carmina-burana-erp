from fastapi import APIRouter, Depends, Query

from src.application.use_cases.audit_logs.get_entity_audit_logs import GetEntityAuditLogsUseCase
from src.application.use_cases.audit_logs.get_user_audit_logs import GetUserAuditLogsUseCase
from src.presentation.dependencies.audit_log_deps import (
    get_entity_audit_logs_use_case,
    get_user_audit_logs_use_case,
)
from src.presentation.schemas.audit_log_schemas import AuditLogResponse
from src.presentation.schemas.pagination_schema import PaginatedResponse
from src.shared.pagination import parse_pagination

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("/user/{user_id}", response_model=PaginatedResponse[AuditLogResponse])
async def get_user_audit_logs(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(5, ge=1),
    use_case: GetUserAuditLogsUseCase = Depends(get_user_audit_logs_use_case),
):
    params = parse_pagination(page, page_size)
    result = await use_case.execute(user_id, params=params)
    return PaginatedResponse.from_page(result)


@router.get("/{entity_type}/{entity_id}", response_model=PaginatedResponse[AuditLogResponse])
async def get_entity_audit_logs(
    entity_type: str,
    entity_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(5, ge=1),
    use_case: GetEntityAuditLogsUseCase = Depends(get_entity_audit_logs_use_case),
):
    params = parse_pagination(page, page_size)
    result = await use_case.execute(entity_type, entity_id, params=params)
    return PaginatedResponse.from_page(result)

# Solo existen GET — no hay DELETE ni PUT en este router

from src.domain.repositories.i_audit_log_repository import IAuditLogRepository
from src.presentation.schemas.audit_log_schemas import AuditLogResponse
from src.shared.pagination import Page, PaginationParams


class GetEntityAuditLogsUseCase:
    def __init__(self, audit_log_repo: IAuditLogRepository):
        self._audit_log_repo = audit_log_repo

    async def execute(
        self,
        entity_type: str,
        entity_id: int,
        params: PaginationParams,
    ) -> Page[dict]:
        logs, total = await self._audit_log_repo.get_by_entity(
            entity_type,
            entity_id,
            offset=params.offset,
            limit=params.limit,
        )

        return Page(
            items=[AuditLogResponse.from_domain(log).model_dump() for log in logs],
            total_items=total,
            params=params,
        )

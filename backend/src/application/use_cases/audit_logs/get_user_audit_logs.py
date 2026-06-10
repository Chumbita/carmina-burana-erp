from typing import Sequence

from src.domain.entities.audit_log import AuditLog
from src.domain.repositories.i_audit_log_repository import IAuditLogRepository


class GetUserAuditLogsUseCase:
    def __init__(self, audit_log_repo: IAuditLogRepository):
        self._audit_log_repo = audit_log_repo

    async def execute(self, user_id: int) -> Sequence[AuditLog]:
        return await self._audit_log_repo.get_by_user(user_id)

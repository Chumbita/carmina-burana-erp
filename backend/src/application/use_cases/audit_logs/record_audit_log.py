from datetime import datetime, timezone

from src.domain.entities.audit_log import AuditLog
from src.domain.repositories.i_audit_log_repository import IAuditLogRepository

VALID_ACTIONS = {"CREATED", "UPDATED"}


class RecordAuditLogUseCase:
    def __init__(self, audit_log_repo: IAuditLogRepository):
        self._audit_log_repo = audit_log_repo

    async def execute(
        self,
        entity_type: str,
        entity_id: int,
        action: str,
        new_data: dict,
        old_data: dict | None = None,
        user_id: int | None = None,
    ) -> AuditLog:
        if action not in VALID_ACTIONS:
            raise ValueError(
                f"Acción inválida: '{action}'. Valores permitidos: {VALID_ACTIONS}"
            )

        audit_log = AuditLog(
            id=0,  # asignado por la BD al hacer flush
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            old_data=old_data,
            new_data=new_data,
            created_at=datetime.now(tz=timezone.utc),
            user_id=user_id,
        )
        return await self._audit_log_repo.save(audit_log)

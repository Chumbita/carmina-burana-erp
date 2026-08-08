from typing import Protocol

from src.domain.entities.audit_log import AuditLog


class IAuditLogRepository(Protocol):
    async def add(self, audit_log: AuditLog) -> AuditLog: ...
    async def get_by_entity(
        self,
        entity_type: str,
        entity_id: int,
        offset: int | None = None,
        limit: int | None = None,
    ) -> tuple[list[AuditLog], int]: ...
    async def get_by_user(
        self,
        user_id: int,
        offset: int | None = None,
        limit: int | None = None,
    ) -> tuple[list[AuditLog], int]: ...
    # No existe delete() ni update() — por diseño

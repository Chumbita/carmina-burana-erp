from typing import Protocol, Sequence

from src.domain.entities.audit_log import AuditLog


class IAuditLogRepository(Protocol):
    async def save(self, audit_log: AuditLog) -> AuditLog: ...
    async def get_by_entity(self, entity_type: str, entity_id: int) -> Sequence[AuditLog]: ...
    async def get_by_user(self, user_id: int) -> Sequence[AuditLog]: ...
    # No existe delete() ni update() — por diseño

from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from src.domain.entities.audit_log import AuditLog


class AuditLogResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    action: str
    old_data: Optional[dict]
    new_data: Optional[dict]
    created_at: datetime
    user_id: Optional[int]

    @classmethod
    def from_domain(cls, audit_log: AuditLog) -> "AuditLogResponse":
        return cls(
            id=audit_log.id,
            entity_type=audit_log.entity_type,
            entity_id=audit_log.entity_id,
            action=audit_log.action,
            old_data=audit_log.old_data,
            new_data=audit_log.new_data,
            created_at=audit_log.created_at,
            user_id=audit_log.user_id,
        )

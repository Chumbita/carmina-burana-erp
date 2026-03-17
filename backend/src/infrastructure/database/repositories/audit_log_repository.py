from datetime import datetime
from typing import Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.domain.entities.audit_log import AuditLog
from src.domain.repositories.i_audit_log_repository import IAuditLogRepository
from src.infrastructure.database.models.audit_log_model import AuditLogModel


class AuditLogRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def save(self, audit_log: AuditLog) -> AuditLog:
        db_model = AuditLogModel(
            user_id=audit_log.user_id,
            entity_type=audit_log.entity_type,
            entity_id=audit_log.entity_id,
            action=audit_log.action,
            old_data=audit_log.old_data,
            new_data=audit_log.new_data,
            created_at=audit_log.created_at,
        )
        self._session.add(db_model)
        await self._session.flush()
        return AuditLog(
            id=db_model.id,
            user_id=audit_log.user_id,
            entity_type=audit_log.entity_type,
            entity_id=audit_log.entity_id,
            action=audit_log.action,
            old_data=audit_log.old_data,
            new_data=audit_log.new_data,
            created_at=audit_log.created_at,
        )

    async def get_by_entity(self, entity_type: str, entity_id: int) -> Sequence[AuditLog]:
        stmt = (
            select(AuditLogModel)
            .where(
                AuditLogModel.entity_type == entity_type,
                AuditLogModel.entity_id   == entity_id,
            )
            .order_by(AuditLogModel.created_at.desc())
        )
        result = await self._session.execute(stmt)
        rows = result.scalars().all()
        return [self._to_domain(row) for row in rows]

    async def get_by_user(self, user_id: int) -> Sequence[AuditLog]:
        stmt = (
            select(AuditLogModel)
            .where(AuditLogModel.user_id == user_id)
            .order_by(AuditLogModel.created_at.desc())
        )
        result = await self._session.execute(stmt)
        rows = result.scalars().all()
        return [self._to_domain(row) for row in rows]

    def _to_domain(self, model: AuditLogModel) -> AuditLog:
        return AuditLog(
            id=model.id,
            user_id=model.user_id,
            entity_type=model.entity_type,
            entity_id=model.entity_id,
            action=model.action,
            old_data=model.old_data,
            new_data=model.new_data,
            created_at=model.created_at,
        )

    # No existe delete() ni update() — por diseño

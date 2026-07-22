from src.application.use_cases.audit_logs.record_audit_log import RecordAuditLogUseCase


class AuditLogService:
    """
    Servicio de dominio que orquesta la generación de logs de auditoría.

    Se inyecta en los casos de uso que modifican items para registrar
    automáticamente CREATED / UPDATED con old_data y new_data.
    """

    def __init__(self, record_audit_log_use_case: RecordAuditLogUseCase):
        self._record = record_audit_log_use_case

    async def log_item_create(
        self,
        entity_id: int,
        new_data: dict,
        user_id: int | None = None,
    ) -> None:
        await self._record.execute(
            entity_type="supply",
            entity_id=entity_id,
            action="CREATED",
            new_data=new_data,
            old_data=None,
            user_id=user_id,
        )

    async def log_item_update(
        self,
        entity_id: int,
        old_data: dict,
        new_data: dict,
        user_id: int | None = None,
    ) -> None:
        await self._record.execute(
            entity_type="supply",
            entity_id=entity_id,
            action="UPDATED",
            new_data=new_data,
            old_data=old_data,
            user_id=user_id,
        )

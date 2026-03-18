from fastapi import HTTPException, status
from src.domain.entities.input import Input
from src.domain.repositories.input_repository import InputRepository
from src.application.use_cases.record_audit_log import RecordAuditLogUseCase

class CreateInputUseCase:

    def __init__(self, repository: InputRepository, audit_log_use_case: RecordAuditLogUseCase = None):
        self.repository = repository
        self._audit_log_use_case = audit_log_use_case

    async def execute(self, data: dict) -> Input:
        new_input = Input(**data)

        # Validar nombre único (sin importar mayúsculas/minúsculas)
        existing = await self.repository.find_by_name(new_input.name)

        if existing:
            if not existing.status:
                existing.status = True
                updated_input = await self.repository.reactivate(existing)
                # Record audit log for reactivation
                if self._audit_log_use_case:
                    await self._audit_log_use_case.execute(
                        entity_type="input",
                        entity_id=updated_input.id,
                        action="UPDATED",
                        old_data={"status": False},
                        new_data={"status": True},
                        user_id=data.get("performed_by")
                    )
                return updated_input
            else:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe un insumo con este nombre"
                )

        created_input = await self.repository.create(new_input)
        # Record audit log for creation
        if self._audit_log_use_case:
            await self._audit_log_use_case.execute(
                entity_type="input",
                entity_id=created_input.id,
                action="CREATED",
                old_data=None,  # no hay estado anterior en creación
                new_data=data,
                user_id=data.get("performed_by")
            )
        return created_input
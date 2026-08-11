from datetime import datetime, timezone

from src.domain.entities.brand import Brand
from src.domain.exceptions.brand_exceptions import DuplicateBrandNameError
from src.domain.repositories.brand_repository import IBrandRepository
from src.application.dtos.brand.brand_commands_dtos import CreateBrandCommand
from src.domain.services.audit_log_service import AuditLogService


class CreateBrandUseCase:
    def __init__(
        self,
        brand_repo: IBrandRepository,
        audit_log_service: AuditLogService | None = None,
    ):
        self._brand_repo = brand_repo
        self._audit_log_service = audit_log_service

    async def execute(self, command: CreateBrandCommand) -> Brand:
        existing = await self._brand_repo.find_by_name(command.name)
        if existing is not None:
            raise DuplicateBrandNameError(command.name)

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        brand = Brand(
            name=command.name,
            created_at=now,
        )
        brand = await self._brand_repo.add(brand)
        if self._audit_log_service is not None:
            await self._audit_log_service.log_brand_create(
                brand.id,
                {
                    "name": brand.name,
                    "is_active": brand.is_active,
                },
            )
        return brand

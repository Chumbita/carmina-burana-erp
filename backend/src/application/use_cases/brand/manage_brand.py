from src.application.dtos.brand.brand_commands_dtos import UpdateBrandCommand
from src.domain.entities.brand import Brand
from src.domain.exceptions.brand_exceptions import BrandNotFoundError, DuplicateBrandNameError
from src.domain.repositories.brand_repository import IBrandRepository
from src.domain.services.audit_log_service import AuditLogService


def _audit_data(brand: Brand) -> dict:
    return {
        "name": brand.name,
        "is_active": brand.is_active,
    }


class GetBrandByIdUseCase:
    def __init__(self, brand_repo: IBrandRepository) -> None:
        self._brand_repo = brand_repo

    async def execute(self, brand_id: int) -> Brand:
        brand = await self._brand_repo.get_by_id(brand_id)
        if brand is None:
            raise BrandNotFoundError(str(brand_id))
        return brand


class UpdateBrandUseCase:
    def __init__(
        self,
        brand_repo: IBrandRepository,
        audit_log_service: AuditLogService | None = None,
    ) -> None:
        self._brand_repo = brand_repo
        self._audit_log_service = audit_log_service

    async def execute(self, command: UpdateBrandCommand) -> Brand:
        brand = await self._brand_repo.get_by_id(command.brand_id)
        if brand is None:
            raise BrandNotFoundError(str(command.brand_id))

        existing = await self._brand_repo.find_by_name(command.name)
        if existing is not None and existing.id != command.brand_id:
            raise DuplicateBrandNameError(command.name)

        old_data = _audit_data(brand)
        brand.update(command.name)
        saved = await self._brand_repo.save(brand)
        if saved is None:
            raise BrandNotFoundError(str(command.brand_id))
        if self._audit_log_service is not None:
            await self._audit_log_service.log_brand_update(saved.id, old_data, _audit_data(saved))
        return saved


class DeactivateBrandUseCase:
    def __init__(
        self,
        brand_repo: IBrandRepository,
        audit_log_service: AuditLogService | None = None,
    ) -> None:
        self._brand_repo = brand_repo
        self._audit_log_service = audit_log_service

    async def execute(self, brand_id: int) -> None:
        brand = await self._brand_repo.get_by_id(brand_id)
        if brand is None:
            raise BrandNotFoundError(str(brand_id))

        old_data = _audit_data(brand)
        brand.deactivate()
        saved = await self._brand_repo.save(brand)
        if saved is None:
            raise BrandNotFoundError(str(brand_id))
        if self._audit_log_service is not None:
            await self._audit_log_service.log_brand_update(saved.id, old_data, _audit_data(saved))

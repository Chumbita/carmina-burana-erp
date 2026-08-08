from src.application.dtos.supplier.supplier_commands_dtos import UpdateSupplierCommand
from src.application.dtos.supplier.supplier_responses_dtos import SupplierResponse
from src.domain.exceptions.supplier_exceptions import (
    DuplicateSupplierNameError,
    SupplierNotFoundError,
)
from src.domain.repositories.supplier_repository import ISupplierRepository
from src.domain.services.audit_log_service import AuditLogService


def _audit_data(supplier) -> dict:
    return {
        "name": supplier.name,
        "email": supplier.email,
        "phone": supplier.phone,
        "address": supplier.address,
        "status": supplier.status.value,
    }


def _to_response(supplier) -> SupplierResponse:
    return SupplierResponse(
        id=supplier.id,
        name=supplier.name,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address,
        status=supplier.status,
        created_at=supplier.created_at,
        updated_at=supplier.updated_at,
    )


class ListSuppliersUseCase:
    def __init__(self, supplier_repo: ISupplierRepository) -> None:
        self._supplier_repo = supplier_repo

    async def execute(self) -> list[SupplierResponse]:
        return [_to_response(supplier) for supplier in await self._supplier_repo.find_all()]


class GetSupplierByIdUseCase:
    def __init__(self, supplier_repo: ISupplierRepository) -> None:
        self._supplier_repo = supplier_repo

    async def execute(self, supplier_id: int) -> SupplierResponse:
        supplier = await self._supplier_repo.find_by_id(supplier_id)
        if supplier is None:
            raise SupplierNotFoundError(str(supplier_id))
        return _to_response(supplier)


class UpdateSupplierUseCase:
    def __init__(
        self,
        supplier_repo: ISupplierRepository,
        audit_log_service: AuditLogService | None = None,
    ) -> None:
        self._supplier_repo = supplier_repo
        self._audit_log_service = audit_log_service

    async def execute(self, command: UpdateSupplierCommand) -> SupplierResponse:
        supplier = await self._supplier_repo.find_by_id(command.supplier_id)
        if supplier is None:
            raise SupplierNotFoundError(str(command.supplier_id))

        existing = await self._supplier_repo.find_by_name(command.name)
        if existing is not None and existing.id != command.supplier_id:
            raise DuplicateSupplierNameError(command.name)

        old_data = _audit_data(supplier)
        supplier.update(
            name=command.name,
            email=command.email,
            phone=command.phone,
            address=command.address,
        )
        saved = await self._supplier_repo.save(supplier)
        if saved is None:
            raise SupplierNotFoundError(str(command.supplier_id))
        if self._audit_log_service is not None:
            await self._audit_log_service.log_supplier_update(saved.id, old_data, _audit_data(saved))
        return _to_response(saved)


class DeactivateSupplierUseCase:
    def __init__(
        self,
        supplier_repo: ISupplierRepository,
        audit_log_service: AuditLogService | None = None,
    ) -> None:
        self._supplier_repo = supplier_repo
        self._audit_log_service = audit_log_service

    async def execute(self, supplier_id: int) -> None:
        supplier = await self._supplier_repo.find_by_id(supplier_id)
        if supplier is None:
            raise SupplierNotFoundError(str(supplier_id))
        old_data = _audit_data(supplier)
        supplier.deactivate()
        saved = await self._supplier_repo.save(supplier)
        if saved is None:
            raise SupplierNotFoundError(str(supplier_id))
        if self._audit_log_service is not None:
            await self._audit_log_service.log_supplier_update(saved.id, old_data, _audit_data(saved))

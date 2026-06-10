from datetime import datetime, timezone

from src.domain.entities.supplier import Supplier
from src.domain.repositories.supplier_repository import ISupplierRepository
from src.domain.exceptions.supplier_exceptions import DuplicateSupplierNameError
from src.application.dtos.supplier.supplier_commands_dtos import CreateSupplierCommand
from src.application.dtos.supplier.supplier_responses_dtos import SupplierResponse


class CreateSupplierUseCase:

    def __init__(self, supplier_repo: ISupplierRepository) -> None:
        self._supplier_repo = supplier_repo

    async def execute(self, command: CreateSupplierCommand) -> SupplierResponse:
        existing = await self._supplier_repo.find_by_name(command.name)
        if existing is not None:
            raise DuplicateSupplierNameError(command.name)

        now = datetime.now(timezone.utc).replace(tzinfo=None)

        supplier = Supplier(
            name=command.name,
            email=command.email,
            phone=command.phone,
            address=command.address,
            created_at=now,
        )

        supplier = await self._supplier_repo.add(supplier)

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

from src.domain.repositories.supplier_repository import ISupplierRepository
from src.domain.exceptions.supplier_exceptions import SupplierNotFoundError
from src.application.dtos.supplier.supplier_responses_dtos import SupplierResponse


class GetSupplierUseCase:

    def __init__(self, supplier_repo: ISupplierRepository) -> None:
        self._supplier_repo = supplier_repo

    async def execute(self, supplier_id: int) -> SupplierResponse:
        supplier = await self._supplier_repo.get_by_id(supplier_id)
        if supplier is None:
            raise SupplierNotFoundError(supplier_id)

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

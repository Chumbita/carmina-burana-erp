from src.application.dtos.supplier.supplier_responses_dtos import SupplierResponse
from src.domain.exceptions.supplier_exceptions import SupplierNotFoundError
from src.domain.repositories.supplier_repository import ISupplierRepository


class GetSupplierByNameUseCase:

    def __init__(self, supplier_repo: ISupplierRepository) -> None:
        self._supplier_repo = supplier_repo

    async def execute(self, name: str) -> SupplierResponse:
        normalized_name = name.strip()
        if not normalized_name:
            raise SupplierNotFoundError(name)

        supplier = await self._supplier_repo.find_by_name(normalized_name)
        if supplier is None:
            raise SupplierNotFoundError(normalized_name)

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

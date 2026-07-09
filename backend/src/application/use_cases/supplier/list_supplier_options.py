from src.application.dtos.supplier.supplier_responses_dtos import SupplierOptionResponse
from src.domain.repositories.supplier_repository import ISupplierRepository


class ListSupplierOptionsUseCase:

    def __init__(self, supplier_repo: ISupplierRepository) -> None:
        self._supplier_repo = supplier_repo

    async def execute(self) -> list[SupplierOptionResponse]:
        suppliers = await self._supplier_repo.find_active()
        return [
            SupplierOptionResponse(id=supplier.id, name=supplier.name)
            for supplier in suppliers
        ]

from src.domain.repositories.supplier_repository import ISupplierRepository
from src.application.dtos.supplier.supplier_responses_dtos import SupplierResponse


class ListSuppliersUseCase:

    def __init__(self, supplier_repo: ISupplierRepository) -> None:
        self._supplier_repo = supplier_repo

    async def execute(self) -> list[SupplierResponse]:
        suppliers = await self._supplier_repo.find_all()

        return [
            SupplierResponse(
                id=s.id,
                name=s.name,
                email=s.email,
                phone=s.phone,
                address=s.address,
                status=s.status,
                created_at=s.created_at,
                updated_at=s.updated_at,
            )
            for s in suppliers
        ]

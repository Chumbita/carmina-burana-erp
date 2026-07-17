import pytest

from src.application.use_cases.supplier.list_supplier_options import ListSupplierOptionsUseCase
from src.domain.entities.supplier import Supplier
from src.domain.value_objects.supplier_status import SupplierStatus


class FakeSupplierRepository:
    async def find_active(self) -> list[Supplier]:
        return [
            Supplier(id=2, name="Zeta", status=SupplierStatus.ACTIVE),
            Supplier(id=1, name="Alfa", status=SupplierStatus.ACTIVE),
        ]


@pytest.mark.asyncio
async def test_list_supplier_options_returns_id_and_name_only():
    use_case = ListSupplierOptionsUseCase(FakeSupplierRepository())

    result = await use_case.execute()

    assert [option.__dict__ for option in result] == [
        {"id": 2, "name": "Zeta"},
        {"id": 1, "name": "Alfa"},
    ]

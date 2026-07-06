from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.supplier_repository import SupplierRepository
from src.application.use_cases.supplier.create_supplier import CreateSupplierUseCase
from src.application.use_cases.supplier.list_suppliers import ListSuppliersUseCase


def build_create_supplier_use_case(
    session: AsyncSession = Depends(get_db),
) -> CreateSupplierUseCase:
    supplier_repo = SupplierRepository(session)
    return CreateSupplierUseCase(supplier_repo=supplier_repo)


def build_list_suppliers_use_case(
    session: AsyncSession = Depends(get_db),
) -> ListSuppliersUseCase:
    supplier_repo = SupplierRepository(session)
    return ListSuppliersUseCase(supplier_repo=supplier_repo)

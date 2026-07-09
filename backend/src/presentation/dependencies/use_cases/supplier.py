from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.supplier_repository import SupplierRepository
from src.application.use_cases.supplier.create_supplier import CreateSupplierUseCase
from src.application.use_cases.supplier.get_supplier_by_name import GetSupplierByNameUseCase
from src.application.use_cases.supplier.list_supplier_options import ListSupplierOptionsUseCase


def build_create_supplier_use_case(
    session: AsyncSession = Depends(get_db),
) -> CreateSupplierUseCase:
    supplier_repo = SupplierRepository(session)
    return CreateSupplierUseCase(supplier_repo=supplier_repo)


def build_get_supplier_by_name_use_case(
    session: AsyncSession = Depends(get_db),
) -> GetSupplierByNameUseCase:
    supplier_repo = SupplierRepository(session)
    return GetSupplierByNameUseCase(supplier_repo=supplier_repo)


def build_list_supplier_options_use_case(
    session: AsyncSession = Depends(get_db),
) -> ListSupplierOptionsUseCase:
    supplier_repo = SupplierRepository(session)
    return ListSupplierOptionsUseCase(supplier_repo=supplier_repo)

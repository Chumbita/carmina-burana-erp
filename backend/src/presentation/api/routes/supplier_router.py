from fastapi import APIRouter, Depends, Query, status

from src.domain.entities.user import User
from src.presentation.dependencies.auth import get_current_user
from src.presentation.schemas.supplier_schema import (
    CreateSupplierRequest,
    SupplierOptionResponse,
    SupplierResponse,
)
from src.presentation.dependencies.use_cases.supplier import (
    build_create_supplier_use_case,
    build_get_supplier_by_name_use_case,
    build_list_supplier_options_use_case,
)
from src.application.use_cases.supplier.create_supplier import CreateSupplierUseCase
from src.application.use_cases.supplier.get_supplier_by_name import GetSupplierByNameUseCase
from src.application.use_cases.supplier.list_supplier_options import ListSupplierOptionsUseCase
from src.application.dtos.supplier.supplier_commands_dtos import CreateSupplierCommand


router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get(
    "/options",
    summary="Listar opciones de proveedores activos",
    response_model=list[SupplierOptionResponse],
)
async def list_supplier_options(
    use_case: ListSupplierOptionsUseCase = Depends(build_list_supplier_options_use_case),
    #current_user: User = Depends(get_current_user),  # auth
) -> list[SupplierOptionResponse]:
    return await use_case.execute()


@router.get(
    "",
    summary="Buscar proveedor por nombre",
    response_model=SupplierResponse,
)
async def get_supplier_by_name(
    name: str = Query(..., min_length=1),
    use_case: GetSupplierByNameUseCase = Depends(build_get_supplier_by_name_use_case),
    #current_user: User = Depends(get_current_user),  # auth
) -> SupplierResponse:
    return await use_case.execute(name)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo proveedor",
    response_model=SupplierResponse,
)
async def create_supplier(
    body: CreateSupplierRequest,
    use_case: CreateSupplierUseCase = Depends(build_create_supplier_use_case),
    #current_user: User = Depends(get_current_user),  # auth
) -> SupplierResponse:
    command = CreateSupplierCommand(
        name=body.name,
        email=body.email,
        phone=body.phone,
        address=body.address,
    )

    return await use_case.execute(command)

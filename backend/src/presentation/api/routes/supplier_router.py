from fastapi import APIRouter, Depends, Query, status

from src.domain.entities.user import User
from src.presentation.dependencies.auth import get_current_user
from src.presentation.schemas.pagination_schema import PaginatedResponse
from src.presentation.schemas.supplier_schema import (
    CreateSupplierRequest,
    SupplierOptionResponse,
    SupplierResponse,
    UpdateSupplierRequest,
)
from src.shared.pagination import parse_pagination
from src.presentation.dependencies.use_cases.supplier import (
    build_deactivate_supplier_use_case,
    build_create_supplier_use_case,
    build_get_supplier_by_id_use_case,
    build_get_supplier_by_name_use_case,
    build_list_suppliers_use_case,
    build_list_supplier_options_use_case,
    build_update_supplier_use_case,
)
from src.application.use_cases.supplier.create_supplier import CreateSupplierUseCase
from src.application.use_cases.supplier.get_supplier_by_name import GetSupplierByNameUseCase
from src.application.use_cases.supplier.list_supplier_options import ListSupplierOptionsUseCase
from src.application.use_cases.supplier.manage_supplier import (
    DeactivateSupplierUseCase,
    GetSupplierByIdUseCase,
    ListSuppliersUseCase,
    UpdateSupplierUseCase,
)
from src.application.dtos.supplier.supplier_commands_dtos import (
    CreateSupplierCommand,
    UpdateSupplierCommand,
)


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
    summary="Listar proveedores paginados",
    response_model=PaginatedResponse[SupplierResponse] | SupplierResponse,
)
async def list_suppliers(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1),
    q: str | None = Query(None),
    status: str | None = Query(None),
    name: str | None = Query(None, min_length=1),
    list_use_case: ListSuppliersUseCase = Depends(build_list_suppliers_use_case),
    by_name_use_case: GetSupplierByNameUseCase = Depends(build_get_supplier_by_name_use_case),
    #current_user: User = Depends(get_current_user),  # auth
) -> PaginatedResponse[SupplierResponse] | SupplierResponse:
    if name is not None:
        return await by_name_use_case.execute(name)
    params = parse_pagination(page, page_size)
    result = await list_use_case.execute(params, q=q, status=status)
    return PaginatedResponse.from_page(result)


@router.get(
    "/{supplier_id}",
    summary="Obtener proveedor por id",
    response_model=SupplierResponse,
)
async def get_supplier_by_id(
    supplier_id: int,
    use_case: GetSupplierByIdUseCase = Depends(build_get_supplier_by_id_use_case),
    #current_user: User = Depends(get_current_user),  # auth
) -> SupplierResponse:
    return await use_case.execute(supplier_id)


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


@router.put(
    "/{supplier_id}",
    summary="Editar proveedor",
    response_model=SupplierResponse,
)
async def update_supplier(
    supplier_id: int,
    body: UpdateSupplierRequest,
    use_case: UpdateSupplierUseCase = Depends(build_update_supplier_use_case),
    #current_user: User = Depends(get_current_user),  # auth
) -> SupplierResponse:
    command = UpdateSupplierCommand(
        supplier_id=supplier_id,
        name=body.name,
        email=body.email,
        phone=body.phone,
        address=body.address,
    )
    return await use_case.execute(command)


@router.delete(
    "/{supplier_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Inactivar proveedor",
)
async def deactivate_supplier(
    supplier_id: int,
    use_case: DeactivateSupplierUseCase = Depends(build_deactivate_supplier_use_case),
    #current_user: User = Depends(get_current_user),  # auth
) -> None:
    await use_case.execute(supplier_id)

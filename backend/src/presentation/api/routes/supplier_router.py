from fastapi import APIRouter, Depends, status

from src.domain.entities.user import User
from src.presentation.dependencies.auth import get_current_user
from src.presentation.schemas.supplier_schema import CreateSupplierRequest, SupplierResponse
from src.presentation.dependencies.use_cases.supplier import build_create_supplier_use_case
from src.application.use_cases.supplier.create_supplier import CreateSupplierUseCase
from src.application.dtos.supplier.supplier_commands_dtos import CreateSupplierCommand


router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


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

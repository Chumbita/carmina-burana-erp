from fastapi import APIRouter, Depends, status
from typing import List

# ── Pseudo middleware ────────────────────────────────────────────────
from src.domain.entities.user import User
from src.presentation.dependencies.auth import get_current_user

uom_router = APIRouter(prefix="/uom", tags=["Uom"])

# ── GET UOM OPTIONS ────────────────────────────────────────────────
#
from src.presentation.schemas.uom_schemas import UomOptionResponse
from src.application.use_cases.uom.list_uom_options_use_case import ListUomOptionsUseCase
from src.presentation.dependencies.use_cases.uom import get_list_uom_options_use_case

@uom_router.get("/options", response_model=List[UomOptionResponse])
async def get_list_uom_options(
    use_case: ListUomOptionsUseCase = Depends(get_list_uom_options_use_case),
    current_user: User = Depends(get_current_user),
):
    return await use_case.execute()


# ── POST CREATE UOM ──────────────────────────────────────────────
#
from src.presentation.schemas.uom_schemas import CreateUomRequest, UomResponse
from src.application.use_cases.uom.create_uom import CreateUomUseCase
from src.application.dtos.uom.uom_commands_dtos import CreateUomCommand
from src.presentation.dependencies.use_cases.uom import get_create_uom_use_case

@uom_router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=UomResponse,
    summary="Crear una nueva unidad de medida",
)
async def create_uom(
    body: CreateUomRequest,
    use_case: CreateUomUseCase = Depends(get_create_uom_use_case),
    current_user: User = Depends(get_current_user),
) -> UomResponse:
    command = CreateUomCommand(
        name=body.name,
        symbol=body.symbol,
        uom_type=body.uom_type,
        is_base=body.is_base,
        factor_to_base=body.factor_to_base,
    )
    return await use_case.execute(command)

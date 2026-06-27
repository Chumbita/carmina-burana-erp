# ══════════════════════════════════════════════════════════════════════════════
# ROUTER - BOM
# ══════════════════════════════════════════════════════════════════════════════

from typing import List

from fastapi import APIRouter, Depends, status

from src.domain.entities.user import User

from src.application.dtos.bom.bom_commands_dtos import CreateBomCommand, CreateBomLineData
from src.application.use_cases.bom.create_bom_use_case import CreateBomUseCase
from src.application.use_cases.bom.list_active_boms_use_case import ListActiveBomsUseCase

from src.presentation.schemas.bom_schemas import (
    CreateBomRequestSchema,
    BomCreatedResponseSchema,
)
from src.presentation.dependencies.use_cases.bom import (
    get_create_bom_use_case,
    get_list_active_boms_use_case,
)
from src.presentation.dependencies.auth import get_current_user


router = APIRouter(prefix="/bom", tags=["BOM"])


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="Listar BOMs activos",
    response_model=List[BomCreatedResponseSchema],
)
async def list_active_boms(
    use_case: ListActiveBomsUseCase = Depends(get_list_active_boms_use_case),
) -> dict:
    """
    Retorna la lista de todos los BOMs activos registrados en el sistema.
    """
    result = await use_case.execute()
    return [BomCreatedResponseSchema.model_validate(item) for item in result]


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Crear BOM con sus líneas",
    response_model=BomCreatedResponseSchema,
)
async def create_bom(
    body: CreateBomRequestSchema,
    use_case: CreateBomUseCase = Depends(get_create_bom_use_case)
) -> dict:
    """
    Crea una nueva versión de BOM con todas sus líneas de componente.
    Cierra automáticamente la versión anterior activa.
    """
    command = CreateBomCommand(
        parent_item_id=body.parent_item_id,
        valid_from=body.valid_from,
        lines=[
            CreateBomLineData(
                component_item_id=line.component_item_id,
                quantity=line.quantity,
                uom=line.uom,
            )
            for line in body.lines
        ],
    )

    result = await use_case.execute(command)
    return BomCreatedResponseSchema.model_validate(result)

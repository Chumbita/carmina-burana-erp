# ══════════════════════════════════════════════════════════════════════════════
# ROUTER - BOM
# ══════════════════════════════════════════════════════════════════════════════

from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status

from src.application.dtos.bom.bom_commands_dtos import (
    CreateBomCommand,
    CreateBomLineData,
)
from src.application.use_cases.bom.create_bom_use_case import CreateBomUseCase
from src.application.use_cases.bom.get_bom_by_id_use_case import GetBomByIdUseCase
from src.application.use_cases.bom.list_active_boms_use_case import (
    ListActiveBomsUseCase,
)
from src.domain.entities.user import User
from src.presentation.dependencies.auth import get_current_user
from src.presentation.dependencies.use_cases.bom import (
    get_bom_by_id_use_case,
    get_create_bom_use_case,
    get_list_active_boms_use_case,
)
from src.presentation.schemas.bom_schemas import (
    BomCreatedResponseSchema,
    BomDetailResponseSchema,
    BomListItemResponseSchema,
    CreateBomRequestSchema,
)
from src.presentation.schemas.pagination_schema import PaginatedResponse
from src.shared.pagination import PaginationParams

router = APIRouter(prefix="/bom", tags=["BOM"])


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="Listar BOMs activos",
)
async def list_active_boms(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=20),
    q: Optional[str] = Query(None),
    sort_by: str = Query("name"),
    sort_order: str = Query("asc"),
    use_case: ListActiveBomsUseCase = Depends(get_list_active_boms_use_case),
) -> PaginatedResponse[BomListItemResponseSchema]:
    params = PaginationParams(page=page, page_size=page_size)
    result = await use_case.execute(params, q=q, sort_by=sort_by, sort_order=sort_order)
    return PaginatedResponse.from_page(result)


@router.get(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Obtener detalle de un BOM",
    response_model=BomDetailResponseSchema,
)
async def get_bom_by_id(
    id: int,
    use_case: GetBomByIdUseCase = Depends(get_bom_by_id_use_case),
) -> dict:
    """
    Retorna el detalle completo de un BOM, incluyendo header y líneas de componente.
    """
    result = await use_case.execute(id)
    return BomDetailResponseSchema.model_validate(result)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Crear BOM con sus líneas",
    response_model=BomCreatedResponseSchema,
)
async def create_bom(
    body: CreateBomRequestSchema,
    use_case: CreateBomUseCase = Depends(get_create_bom_use_case),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Crea una nueva versión de BOM con todas sus líneas de componente.
    Cierra automáticamente la versión anterior activa.
    """
    command = CreateBomCommand(
        parent_item_id=body.parent_item_id,
        quantity=body.quantity,
        uom_id=body.uom_id,
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

    result = await use_case.execute(command, user_id=current_user.id)
    return BomCreatedResponseSchema.model_validate(result)

# ══════════════════════════════════════════════════════════════════════════════
# ROUTER - ITEMS
# ══════════════════════════════════════════════════════════════════════════════

from typing import List

from fastapi import APIRouter, Depends, status, HTTPException

from src.domain.entities.user import User

from src.application.use_cases.item.production_order.get_item_manufacturable import GetManufacturableItemsUseCase
from src.application.use_cases.bom.get_item_bom_use_case import GetItemBomUseCase

from src.presentation.schemas.item_schema import ManufacturableItemSchema
from src.presentation.schemas.production_order_schemas import ItemBomSchema

from src.presentation.dependencies.use_cases.item import get_manufacturable_items_use_case
from src.presentation.dependencies.use_cases.bom import get_item_bom_use_case
from src.presentation.dependencies.auth import get_current_user


router = APIRouter(prefix="/items", tags=["Items"])


@router.get(
    "/manufacturable-items",
    status_code=status.HTTP_200_OK,
    summary="Listar ítems manufacturables",
    response_model=List[ManufacturableItemSchema],
)
async def get_manufacturable_items(
    use_case: GetManufacturableItemsUseCase = Depends(get_manufacturable_items_use_case),
    # current_user: User = Depends(get_current_user),
) -> List[dict]:
    """
    Retorna la lista de todos los ítems que están habilitados para ser manufacturados.
    """
    result = await use_case.execute()
    return [ManufacturableItemSchema.model_validate(item) for item in result]


@router.get(
    "/{item_id}/bom",
    status_code=status.HTTP_200_OK,
    summary="Obtener BOM activa de un ítem",
    response_model=ItemBomSchema,
)
async def get_item_bom(
    item_id: int,
    use_case: GetItemBomUseCase = Depends(get_item_bom_use_case),
    # current_user: User = Depends(get_current_user),
) -> dict:
    """
    Retorna la estructura de la lista de materiales (BOM) activa asociada a un ítem específico.
    Si el ítem no posee una BOM activa, devuelve un error 404.
    """
    bom = await use_case.execute(item_id)
    if not bom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="El ítem no tiene una BOM activa"
        )

    return ItemBomSchema.model_validate(bom)
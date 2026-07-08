from fastapi import APIRouter, Depends

from src.domain.entities.user import User
from src.presentation.dependencies.use_cases.item import get_manufacturable_items_use_case
from src.presentation.schemas.item_schema import ManufacturableItemSchema
from src.application.use_cases.item.production_order.get_item_manufacturable import GetManufacturableItemsUseCase

from src.presentation.dependencies.auth import get_current_user

router = APIRouter(prefix="/production-orders", tags=["Production Orders"])


@router.get("/manufacturable-items", response_model=list[ManufacturableItemSchema])
async def get_manufacturable_items(
    use_case: GetManufacturableItemsUseCase = Depends(get_manufacturable_items_use_case),
    #current_user: User = Depends(get_current_user), 
):
    return await use_case.execute()
from fastapi import APIRouter, Depends, status

from src.presentation.schemas.supply_schemas import CreateSupplyRequestSchema
from src.presentation.dependencies.use_cases.supply import get_create_supply_use_case
from src.application.use_cases.item.create_item_use_case import CreateItemUseCase
from src.application.dtos.item_dtos import CreateItemCommand

router = APIRouter(prefix="/supplies", tags=["Supplies"])


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Crear insumo",
)
async def create_supply(
    body: CreateSupplyRequestSchema,
    use_case: CreateItemUseCase = Depends(get_create_supply_use_case),
) -> dict:
    command = CreateItemCommand(
        name=body.name,
        item_type_id=1,
        brand_id=body.brand_id,
        base_uom_id=body.base_uom_id,
        is_stockable=True,
        is_batch_tracked=body.is_batch_tracked,
        min_stock_level=body.min_stock_level,
        is_manufacturable=False,
        is_purchasable=True,
        is_sellable=False,
        specialized_data={
            "supply_category": body.supply_category.value,
        },
    )
    result = await use_case.execute(command)
    return vars(result)
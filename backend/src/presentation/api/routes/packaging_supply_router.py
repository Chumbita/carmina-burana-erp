from typing import List

from fastapi import APIRouter, Depends
from fastapi import status

from src.domain.entities.user import User

from src.application.dtos.items.item_commands_dtos import CreateItemCommand
from src.application.use_cases.item.create_specialized_item import CreateItemUseCase
from src.application.use_cases.packaging_supply.read_packaging_supply import ListActivePackagingSuppliesUseCase

from src.infrastructure.database.repositories.packaging_supply_repository import PackagingSupplyRepository

from src.presentation.schemas.packaging_supply_schemas import (
    CreatePackagingSupplyRequestSchema,
    PackagingSupplyGeneralResponseSchema,
    PackagingSupplyResponseSchema,
)
from src.presentation.dependencies.use_cases.packaging_supply import (
    get_create_packaging_supply_use_case,
    get_list_active_packaging_supplies_use_case,
    get_packaging_supply_repository,
    get_packaging_supply_item_type_id,
)
from src.domain.value_objects.packaging_type import PackagingType
from src.presentation.dependencies.auth import get_current_user


router = APIRouter(prefix="/packaging-supplies", tags=["Packaging Supplies"])


@router.get("", response_model=List[PackagingSupplyGeneralResponseSchema], summary="Listar packaging supplies activos")
async def list_active_packaging_supplies(
    use_case: ListActivePackagingSuppliesUseCase = Depends(get_list_active_packaging_supplies_use_case),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    return await use_case.execute()


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=PackagingSupplyResponseSchema,
    summary="Crear insumo de packaging",
)
async def create_packaging_supply(
    body: CreatePackagingSupplyRequestSchema,
    item_type_id: int = Depends(get_packaging_supply_item_type_id),
    use_case: CreateItemUseCase = Depends(get_create_packaging_supply_use_case),
    repo: PackagingSupplyRepository = Depends(get_packaging_supply_repository),
    current_user: User = Depends(get_current_user),
) -> dict:
    command = CreateItemCommand(
        name=body.name,
        item_type_id=item_type_id,
        brand_id=body.brand_id,
        base_uom_id=body.base_uom_id,
        is_stockable=True,
        is_batch_tracked=True,
        min_stock_level=body.min_stock_level,
        is_manufacturable=False,
        is_purchasable=True,
        is_sellable=False,
        specialized_data={
            "packaging_type": body.packaging_type.value,
            "material": body.material,
            "capacity_ml": body.capacity_ml,
        },
    )

    item_result = await use_case.execute(command)
    detail = await repo.get_creation_detail(item_result.id)

    return PackagingSupplyResponseSchema(
        id=detail.id,
        name=detail.name,
        brand_name=detail.brand_name,
        base_uom_symbol=detail.base_uom_symbol,
        min_stock_level=detail.min_stock_level,
        packaging_type=PackagingType(detail.packaging_type),
        material=detail.material,
        capacity_ml=detail.capacity_ml,
    )
from typing import List
from fastapi import APIRouter, Depends, status, HTTPException

from src.presentation.schemas.supply_schemas import (
    CreateSupplyRequestSchema,
    UpdateSupplyRequestSchema,
    SupplyResponseSchema
)
from src.presentation.dependencies.use_cases.supply import (
    get_create_supply_use_case,
    get_supply_repository,
    get_list_supplies_use_case,
    get_get_supply_use_case,
    get_update_supply_use_case,
    get_delete_supply_use_case,
)
from src.application.use_cases.item.create_item_use_case import CreateItemUseCase
from src.application.use_cases.supply.list_supplies_use_case import ListSuppliesUseCase
from src.application.use_cases.supply.get_supply_use_case import GetSupplyUseCase, ItemNotFoundException
from src.application.use_cases.supply.update_supply_use_case import UpdateSupplyUseCase, UpdateSupplyCommand
from src.application.use_cases.supply.delete_supply_use_case import DeleteSupplyUseCase
from src.application.dtos.item_dtos import CreateItemCommand
from src.infrastructure.database.repositories.supply_repository import SupplyRepository

router = APIRouter(prefix="/supplies", tags=["Supplies"])


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Crear insumo",
    response_model=SupplyResponseSchema,
)
async def create_supply(
    body: CreateSupplyRequestSchema,
    use_case: CreateItemUseCase = Depends(get_create_supply_use_case),
    supply_repository: SupplyRepository = Depends(get_supply_repository),
) -> SupplyResponseSchema:
    """
    Crea un insumo (item + supply) de forma atómica.
    Retorna tanto los datos del item base como los específicos del supply.
    """
    command = CreateItemCommand(
        name=body.name,
        item_type_id=1,
        brand_id=body.brand_id,
        base_uom_id=body.base_uom_id,
        is_stockable=True,
        is_batch_tracked=True,
        min_stock_level=body.min_stock_level,
        is_manufacturable=False,
        is_purchasable=True,
        is_sellable=False,
        specialized_data={
            "supply_category": body.supply_category.value,
        },
    )
    
    item_result = await use_case.execute(command)
    supply = await supply_repository.get_by_item_id(item_result.id)
    
    return SupplyResponseSchema(
        id=item_result.id,
        name=item_result.name,
        item_type_id=item_result.item_type_id,
        brand_id=item_result.brand_id,
        base_uom_id=item_result.base_uom_id,
        is_stockable=item_result.is_stockable,
        is_batch_tracked=item_result.is_batch_tracked,
        min_stock_level=item_result.min_stock_level,
        is_manufacturable=item_result.is_manufacturable,
        is_purchasable=item_result.is_purchasable,
        is_sellable=item_result.is_sellable,
        status=item_result.status,
        created_at=item_result.created_at,
        updated_at=item_result.updated_at,
        deleted_at=item_result.deleted_at,
        supply_category=supply.supply_category,
    )


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="Listar insumos",
    response_model=List[SupplyResponseSchema],
)
async def list_supplies(
    use_case: ListSuppliesUseCase = Depends(get_list_supplies_use_case),
) -> List[SupplyResponseSchema]:
    """
    Lista todos los insumos activos.
    """
    supplies = await use_case.execute()
    return [SupplyResponseSchema(**vars(supply)) for supply in supplies]


@router.get(
    "/{supply_id}",
    status_code=status.HTTP_200_OK,
    summary="Obtener insumo por ID",
    response_model=SupplyResponseSchema,
)
async def get_supply(
    supply_id: int,
    use_case: GetSupplyUseCase = Depends(get_get_supply_use_case),
) -> SupplyResponseSchema:
    """
    Obtiene un insumo específico por su ID.
    """
    try:
        supply = await use_case.execute(supply_id)
        return SupplyResponseSchema(**vars(supply))
    except ItemNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.put(
    "/{supply_id}",
    status_code=status.HTTP_200_OK,
    summary="Actualizar insumo",
    response_model=SupplyResponseSchema,
)
async def update_supply(
    supply_id: int,
    body: UpdateSupplyRequestSchema,
    use_case: UpdateSupplyUseCase = Depends(get_update_supply_use_case),
) -> SupplyResponseSchema:
    """
    Actualiza un insumo existente.
    """
    try:
        command = UpdateSupplyCommand(
            supply_id=supply_id,
            name=body.name,
            brand_id=body.brand_id,
            base_uom_id=body.base_uom_id,
            min_stock_level=body.min_stock_level,
            supply_category=body.supply_category,
        )
        updated_supply = await use_case.execute(command)
        return SupplyResponseSchema(**vars(updated_supply))
    except ItemNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.delete(
    "/{supply_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar insumo (soft delete)",
)
async def delete_supply(
    supply_id: int,
    use_case: DeleteSupplyUseCase = Depends(get_delete_supply_use_case),
) -> None:
    """
    Elimina un insumo (soft delete).
    Marca el item como eliminado sin borrarlo físicamente.
    """
    try:
        await use_case.execute(supply_id)
    except ItemNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
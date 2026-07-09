from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from src.application.use_cases.supply.read_supply import GetActiveSupplyDetailUseCase, ListActiveSuppliesUseCase
from src.application.use_cases.supply.delete_supply import DeleteSupplyUseCase
from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.domain.exceptions.supply_exceptions import SupplyHasStockException
from src.domain.entities.user import User
from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.domain.exceptions.supply_exceptions import SupplyHasStockException

from src.infrastructure.database.repositories.supply_repository import SupplyRepository

from src.application.dtos.items.item_commands_dtos import CreateItemCommand
from src.application.dtos.items.item_commands_dtos import UpdateItemCommand

from src.application.use_cases.supply.read_supply import GetActiveSupplyDetailUseCase, ListActiveSuppliesUseCase
from src.application.use_cases.supply.delete_supply import DeleteSupplyUseCase
from src.application.use_cases.item.create_specialized_item import CreateItemUseCase
from src.application.use_cases.supply.update_supply import UpdateSupplyUseCase

from src.presentation.schemas.supply_schemas import (
    CreateSupplyRequestSchema,
    SupplyDetailResponseSchema,
    SupplyGeneralResponseSchema,
    SupplyResponseSchema,
    UpdateSupplyRequestSchema,
)
from src.presentation.dependencies.use_cases.supply import (
    get_active_supply_detail_use_case,
    get_create_supply_use_case,
    get_list_active_supplies_use_case,
    get_supply_repository,
    get_delete_supply_use_case,
    get_update_supply_use_case,
)
from src.presentation.dependencies.auth import get_current_user


router = APIRouter(prefix="/supplies", tags=["Supplies"])


@router.get("", response_model=List[SupplyGeneralResponseSchema], summary="Listar insumos activos")
async def list_active_supplies(
    use_case: ListActiveSuppliesUseCase = Depends(get_list_active_supplies_use_case),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    return await use_case.execute()


@router.get("/{item_id}", response_model=SupplyDetailResponseSchema, summary="Detalle de insumo activo")
async def get_active_supply_detail(
    item_id: int,
    use_case: GetActiveSupplyDetailUseCase = Depends(get_active_supply_detail_use_case),
    current_user: User = Depends(get_current_user),
) -> dict:
    try:
        return await use_case.execute(item_id)
    except ItemNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


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
    current_user: User = Depends(get_current_user),
) -> dict:
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


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar insumo (soft delete)",
)
async def delete_supply(
    item_id: int,
    use_case: DeleteSupplyUseCase = Depends(get_delete_supply_use_case),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Soft delete de un insumo. Marca el item como DELETED.
    No se puede eliminar si el insumo tiene stock activo.
    """
    try:
        await use_case.execute(item_id)
        return {"message": "Insumo eliminado correctamente"}

    except SupplyHasStockException as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    except ItemNotFoundException as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
@router.patch(
    "/{supply_id}",
    status_code=status.HTTP_200_OK,
    summary="Actualizar insumo",
    response_model=SupplyDetailResponseSchema,
)
async def update_supply(
    supply_id: int,
    body: UpdateSupplyRequestSchema,
    use_case: UpdateSupplyUseCase = Depends(get_update_supply_use_case),
    current_user: User = Depends(get_current_user),
) -> dict:
    command = UpdateItemCommand(
        item_id=supply_id,
        name=body.name,
        brand_id=body.brand_id,
        base_uom_id=body.base_uom_id,
        min_stock_level=body.min_stock_level,
        is_manufacturable=body.is_manufacturable,
        is_purchasable=body.is_purchasable,
        is_sellable=body.is_sellable,
        specialized_data={"supply_category": body.supply_category.value} if body.supply_category else None,
    )
    return await use_case.execute(command)




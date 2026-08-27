from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List

from src.application.use_cases.item.delete_item import DeleteItemUseCase
from src.domain.exceptions.item_exceptions import ItemNotFoundException, ItemHasStockException
from src.domain.entities.user import User

from src.infrastructure.database.repositories.supply_repository import SupplyRepository

from src.application.dtos.items.item_commands_dtos import CreateItemCommand
from src.application.dtos.items.item_commands_dtos import UpdateItemCommand

from src.application.use_cases.supply.read_supply import GetActiveSupplyDetailUseCase, ListActiveSuppliesUseCase
from src.application.use_cases.item.create_specialized_item import CreateItemUseCase
from src.application.use_cases.supply.update_supply import UpdateSupplyUseCase

from src.application.use_cases.inventory.get_lots_by_item import GetLotsByItemUseCase
from src.domain.value_objects.lot_status import LotStatus
from src.presentation.dependencies.use_cases.inventory import build_get_lots_by_item, get_adjust_lot_quantity_use_case
from src.presentation.schemas.lot_schema import LotResponse
from src.presentation.schemas.pagination_schema import PaginatedResponse
from src.shared.pagination import parse_pagination
from src.presentation.schemas.inventory_adjust_schema import AdjustLotRequest, AdjustLotResponse
from src.application.dtos.inventory.adjust_lot_dtos import AdjustLotCommand
from src.domain.exceptions.inventory_exceptions import InventoryDomainError, LotNotFoundError
from src.domain.exceptions.item_exceptions import ItemNotFoundException

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
    get_delete_item_use_case
)
from src.presentation.dependencies.auth import get_current_user


router = APIRouter(prefix="/supplies", tags=["Supplies"])


@router.get("", response_model=PaginatedResponse[SupplyGeneralResponseSchema], summary="Listar insumos activos")
async def list_active_supplies(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1),
    q: str | None = Query(None),
    category: str | None = Query(None),
    item_type: str | None = Query(None),
    stock_status: str | None = Query(None),
    sort_by: str = Query("name"),
    sort_order: str = Query("asc"),
    use_case: ListActiveSuppliesUseCase = Depends(get_list_active_supplies_use_case),
    current_user: User = Depends(get_current_user),
) -> PaginatedResponse[SupplyGeneralResponseSchema]:
    """
    Lista insumos activos (supply + packaging_supply) paginados.
    Incluye stock total y estado del stock. Filtros: q (nombre/marca),
    category, item_type (SUPPLY / PACKAGING_SUPPLY), stock_status
    (critico / bajo / optimo) y orden (sort_by: id | name | stock).
    """
    params = parse_pagination(page, page_size, max_page_size=25)
    result = await use_case.execute(
        params,
        q=q,
        category=category,
        item_type=item_type,
        stock_status=stock_status,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse.from_page(result)


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

    item_result = await use_case.execute(command, user_id=current_user.id)
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
    use_case: DeleteItemUseCase = Depends(get_delete_item_use_case),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Soft delete de un insumo. Marca el item como DELETED.
    No se puede eliminar si el insumo tiene stock activo.
    """
    try:
        await use_case.execute(item_id)
        return {"message": "Insumo eliminado correctamente"}

    except ItemHasStockException as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    except ItemNotFoundException as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

@router.get(
    "/{item_id}/lots",
    response_model=PaginatedResponse[LotResponse],
    summary="Listar lotes de un insumo (paginado)",
)
async def get_supply_lots(
    item_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(5, ge=1),
    status: list[LotStatus] | None = Query(default=None),
    use_case: GetLotsByItemUseCase = Depends(build_get_lots_by_item),
    #current_user: User = Depends(get_current_user),
) -> PaginatedResponse[LotResponse]:
    params = parse_pagination(page, page_size)
    result = await use_case.execute(
        item_id,
        params=params,
        status=set(status) if status else None,
    )
    return PaginatedResponse.from_page(result)


@router.post(
    "/{item_id}/lots/{lot_id}/adjust",
    status_code=status.HTTP_200_OK,
    summary="Ajustar cantidad de lote por auditoría",
    response_model=AdjustLotResponse,
)
async def adjust_lot_quantity(
    item_id: int,
    lot_id: int,
    body: AdjustLotRequest,
    use_case=Depends(get_adjust_lot_quantity_use_case),
    current_user: User = Depends(get_current_user),
):
    """
    Ajuste manual de stock de un lote. Calcula el delta entre la cantidad
    actual y la nueva cantidad contada, actualiza el balance y registra
    transacción INVENTORY_COUNT_ADJUSTMENT + audit log con motivo.
    """
    try:
        command = AdjustLotCommand(
            item_id=item_id,
            lot_id=lot_id,
            new_quantity=body.new_quantity,
            reason=body.reason,
            user_id=current_user.id,
        )
        result = await use_case.execute(command)
        return AdjustLotResponse(
            item_id=result.item_id,
            lot_id=result.lot_id,
            previous_quantity=result.previous_quantity,
            new_quantity=result.new_quantity,
            delta=result.delta,
            reserved_quantity=result.reserved_quantity,
        )
    except LotNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ItemNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InventoryDomainError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


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
    return await use_case.execute(command, user_id=current_user.id)




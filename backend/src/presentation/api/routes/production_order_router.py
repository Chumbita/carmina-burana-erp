from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder

from src.domain.entities.user import User
from src.domain.entities.production_order import ProductionOrder
from src.domain.exceptions.production_exceptions import (
    ProductionOrderNotFoundException,
    BomNotFoundException,
    InsufficientStockForProductionException,
)

from src.application.use_cases.production_order.create_production_order import CreateProductionOrderUseCase
from src.application.use_cases.production_order.release_production_order import ReleaseProductionOrderUseCase
from src.application.use_cases.production_order.start_production_order import StartProductionOrderUseCase
from src.application.use_cases.production_order.complete_production_order import CompleteProductionOrderUseCase
from src.application.use_cases.production_order.get_production_order import ListIncompleteProductionsUseCase
from src.presentation.schemas.production_order_schemas import (
    CreateProductionOrderSchema,
    CompleteProductionOrderRequestSchema,
    ProductionOrderResponseSchema,
)
from src.presentation.dependencies.use_cases.production_order import (
    get_create_production_order_use_case,
    get_release_production_order_use_case,
    get_start_production_order_use_case,
    get_complete_production_order_use_case,
    get_list_incomplete_productions_use_case,
)
from src.presentation.dependencies.auth import get_current_user


router = APIRouter(prefix="/production-orders", tags=["Production Orders"])


# ── Helper ─────────────────────────────────────────────────────────────────

def _build_response(order: ProductionOrder) -> ProductionOrderResponseSchema:
    return ProductionOrderResponseSchema(
        id=order.id,
        item_id=order.item_id,
        bom_id=order.bom_id,
        planned_quantity=order.planned_quantity,
        produced_quantity=order.produced_quantity,
        status=order.status.value,
        schedule_date=order.schedule_date,
        description=order.description,
        created_at=order.created_at,
        completed_at=order.completed_at,
    )


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.get(
    "/incomplete",
    status_code=status.HTTP_200_OK,
    response_model=list[dict], 
    summary="Obtener todas las órdenes de producción incompletas",
)
async def get_incomplete_productions(
    use_case: ListIncompleteProductionsUseCase = Depends(get_list_incomplete_productions_use_case),
    # current_user: User = Depends(get_current_user),
) -> list[dict]:
    try:
        return await use_case.execute()
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=ProductionOrderResponseSchema,
    summary="Crear orden de producción",
)
async def create_production_order(
    body: CreateProductionOrderSchema,
    use_case: CreateProductionOrderUseCase = Depends(get_create_production_order_use_case),
    # current_user: User = Depends(get_current_user),
) -> ProductionOrderResponseSchema:
    try:
        order = await use_case.execute(
            item_id=body.item_id,
            bom_id=body.bom_id,
            planned_quantity=body.planned_quantity,
            schedule_date=body.schedule_date,
            description=body.description,
        )
        return _build_response(order)
    except BomNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post(
    "/{order_id}/release",
    status_code=status.HTTP_200_OK,
    response_model=ProductionOrderResponseSchema,
    summary="Liberar orden de producción",
)
async def release_production_order(
    order_id: int,
    use_case: ReleaseProductionOrderUseCase = Depends(get_release_production_order_use_case),
    # current_user: User = Depends(get_current_user),
) -> ProductionOrderResponseSchema:
    try:
        order = await use_case.execute(order_id)
        return _build_response(order)
    except ProductionOrderNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InsufficientStockForProductionException as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=jsonable_encoder({
            "message": "Stock insuficiente para liberar la orden",
            "missing": exc.missing
        })
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post(
    "/{order_id}/start",
    status_code=status.HTTP_200_OK,
    response_model=ProductionOrderResponseSchema,
    summary="Iniciar orden de producción",
)
async def start_production_order(
    order_id: int,
    use_case: StartProductionOrderUseCase = Depends(get_start_production_order_use_case),
    # current_user: User = Depends(get_current_user),
) -> ProductionOrderResponseSchema:
    try:
        order = await use_case.execute(order_id)
        return _build_response(order)
    except ProductionOrderNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except BomNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InsufficientStockForProductionException as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "Stock insuficiente para iniciar la producción",
                "missing": exc.missing,
            },
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post(
    "/{order_id}/complete",
    status_code=status.HTTP_200_OK,
    response_model=ProductionOrderResponseSchema,
    summary="Completar orden de producción",
)
async def complete_production_order(
    order_id: int,
    body: CompleteProductionOrderRequestSchema,
    use_case: CompleteProductionOrderUseCase = Depends(get_complete_production_order_use_case),
    # current_user: User = Depends(get_current_user),
) -> ProductionOrderResponseSchema:
    try:
        order = await use_case.execute(
            order_id=order_id,
            produced_quantity=body.produced_quantity,
            lot_code=body.lot_code,
            unit_cost=body.unit_cost,
            production_date=body.production_date,
            expiration_date=body.expiration_date,
        )
        return _build_response(order)
    except ProductionOrderNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


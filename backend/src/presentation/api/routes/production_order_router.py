from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder

from src.domain.entities.user import User
from src.domain.entities.production_order import ProductionOrder
from src.domain.exceptions.production_exceptions import (
    ProductionOrderNotFoundException,
    ProductionOrderCannotBeCancelledException,
    ProductionOrderCannotBeDiscardedException,
    BomNotFoundException,
    InsufficientStockForProductionException,
)

from src.application.use_cases.production_order.plan_production_order import PlanProductionOrderUseCase
from src.application.use_cases.production_order.execute_production_order import ExecuteProductionOrderUseCase
from src.application.use_cases.production_order.create_production_order import CreateProductionOrderUseCase
from src.application.use_cases.production_order.cancel_production_order import CancelProductionOrderUseCase
from src.application.use_cases.production_order.discard_production_order import DiscardProductionOrderUseCase
from src.application.use_cases.production_order.get_production_order import (
    ListIncompleteProductionsUseCase,
    ListFinishedProductionsUseCase,
)
from src.application.use_cases.production_order.get_production_order_by_id_use_case import (
    GetProductionOrderByIdUseCase,
)
from src.presentation.schemas.production_order_schemas import (
    CreateProductionOrderSchema,
    CompleteProductionOrderRequestSchema,
    DiscardProductionOrderRequestSchema,
    ProductionOrderResponseSchema,
    ProductionOrderDetailSchema,
)
from src.presentation.dependencies.use_cases.production_order import (
    get_plan_production_order_use_case,
    get_execute_production_order_use_case,
    get_cancel_production_order_use_case,
    get_list_incomplete_productions_use_case,
    get_list_finished_productions_use_case,
    get_discard_production_order_use_case,
    get_production_order_by_id_use_case,
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


@router.get(
    "/history",
    status_code=status.HTTP_200_OK,
    response_model=list[dict],
    summary="Obtener todas las órdenes de producción no planificadas (historial de cocciones)",
)
async def get_finished_productions(
    use_case: ListFinishedProductionsUseCase = Depends(get_list_finished_productions_use_case),
    # current_user: User = Depends(get_current_user),
) -> list[dict]:
    try:
        return await use_case.execute()
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get(
    "/{order_id}",
    status_code=status.HTTP_200_OK,
    response_model=ProductionOrderDetailSchema,
    summary="Obtener detalle de una orden de producción",
)
async def get_production_order_detail(
    order_id: int,
    use_case: GetProductionOrderByIdUseCase = Depends(get_production_order_by_id_use_case),
    # current_user: User = Depends(get_current_user),
) -> ProductionOrderDetailSchema:
    """
    Retorna el detalle completo de una orden de producción, incluyendo
    header, consumptions y outputs con nombre de item, código de lote y
    unidad de medida. Para órdenes PLANNED incluye los insumos que la
    producción va a ocupar (cantidades escaladas a la cantidad planificada)
    y el costo unitario estimado.
    """
    try:
        return await use_case.execute(order_id)
    except ProductionOrderNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post(
    "/plan",
    status_code=status.HTTP_201_CREATED,
    response_model=ProductionOrderResponseSchema,
    summary="Planificar orden de producción (crear + reservar stock)",
)
async def plan_production_order(
    body: CreateProductionOrderSchema,
    use_case: PlanProductionOrderUseCase = Depends(get_plan_production_order_use_case),
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
    except InsufficientStockForProductionException as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=jsonable_encoder({
                "message": "Stock insuficiente para planificar la orden",
                "missing": exc.missing,
            }),
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post(
    "/{order_id}/execute",
    status_code=status.HTTP_200_OK,
    response_model=ProductionOrderResponseSchema,
    summary="Ejecutar orden de producción (consumir stock + generar output + completar)",
)
async def execute_production_order(
    order_id: int,
    body: CompleteProductionOrderRequestSchema,
    use_case: ExecuteProductionOrderUseCase = Depends(get_execute_production_order_use_case),
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
    except InsufficientStockForProductionException as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=jsonable_encoder({
                "message": "Stock insuficiente para ejecutar la producción",
                "missing": exc.missing,
            }),
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post(
    "/{order_id}/cancel",
    status_code=status.HTTP_200_OK,
    response_model=ProductionOrderResponseSchema,
    summary="Cancelar orden de producción",
)
async def cancel_production_order(
    order_id: int,
    use_case: CancelProductionOrderUseCase = Depends(get_cancel_production_order_use_case),
    # current_user: User = Depends(get_current_user),
) -> ProductionOrderResponseSchema:
    try:
        order = await use_case.execute(order_id)
        return _build_response(order)
    except ProductionOrderNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ProductionOrderCannotBeCancelledException as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post(
    "/{order_id}/discard",
    status_code=status.HTTP_200_OK,
    response_model=ProductionOrderResponseSchema,
    summary="Descartar orden de producción",
)
async def discard_production_order(
    order_id: int,
    body: DiscardProductionOrderRequestSchema,
    use_case: DiscardProductionOrderUseCase = Depends(get_discard_production_order_use_case),
    # current_user: User = Depends(get_current_user),
) -> ProductionOrderResponseSchema:
    try:
        order = await use_case.execute(order_id, body.description)
        return _build_response(order)
    except ProductionOrderNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ProductionOrderCannotBeDiscardedException as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


from fastapi import APIRouter, Depends, HTTPException, status

from src.domain.entities.user import User
from src.application.use_cases.production_order.create_production_order import CreateProductionOrderUseCase
from src.application.use_cases.production_order.release_production_order import ReleaseProductionOrderUseCase
from src.presentation.schemas.production_order_schemas import (
    CreateProductionOrderSchema,
    ProductionOrderResponseSchema,
)
from src.presentation.dependencies.use_cases.production_order import (
    get_create_production_order_use_case,
    get_release_production_order_use_case
)
from src.presentation.dependencies.auth import get_current_user

router = APIRouter(prefix="/production-orders", tags=["Production Orders"])


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=ProductionOrderResponseSchema,
    summary="Crear orden de producción",
)
async def create_production_order(
    body: CreateProductionOrderSchema,
    use_case: CreateProductionOrderUseCase = Depends(get_create_production_order_use_case),
    current_user: User = Depends(get_current_user),
) -> ProductionOrderResponseSchema:
    try:
        order = await use_case.execute(
            item_id=body.item_id,
            bom_id=body.bom_id,
            planned_quantity=body.planned_quantity,
            schedule_date=body.schedule_date,
            description=body.description,
        )

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
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

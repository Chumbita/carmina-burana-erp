from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.domain.entities.user import User
from src.application.use_cases.production_order.create_production_order import CreateProductionOrderUseCase
from src.application.use_cases.production_order.release_production_order import ReleaseProductionOrderUseCase
from src.infrastructure.database.deps import get_db
from src.infrastructure.database.models.beer_model import BeerModel
from src.infrastructure.database.models.bom_model import BomModel
from src.infrastructure.database.models.item_model import ItemModel
from src.infrastructure.database.models.product_model import ProductModel
from src.presentation.schemas.production_order_schemas import (
    CreateProductionOrderSchema,
    ProductionBomLineOptionSchema,
    ProductionBomOptionSchema,
    ProductionItemOptionSchema,
    ProductionOrderResponseSchema,
)
from src.presentation.dependencies.use_cases.production_order import (
    get_create_production_order_use_case,
    get_release_production_order_use_case,
)
from src.presentation.dependencies.auth import get_current_user

router = APIRouter(prefix="/production-orders", tags=["Production Orders"])


@router.get(
    "/options",
    response_model=List[ProductionItemOptionSchema],
    summary="Listar productos y cervezas producibles",
)
async def list_production_options(
    session: AsyncSession = Depends(get_db),
) -> List[ProductionItemOptionSchema]:
    stmt = (
        select(BomModel, ItemModel, BeerModel, ProductModel)
        .join(ItemModel, ItemModel.id == BomModel.parent_item_id)
        .outerjoin(BeerModel, BeerModel.item_id == ItemModel.id)
        .outerjoin(ProductModel, ProductModel.item_id == ItemModel.id)
        .where(
            BomModel.is_active.is_(True),
            ItemModel.is_manufacturable.is_(True),
            ItemModel.status == "ACTIVE",
            or_(BeerModel.item_id.is_not(None), ProductModel.item_id.is_not(None)),
        )
        .options(selectinload(BomModel.lines))
        .order_by(ItemModel.name.asc(), BomModel.version.desc())
    )
    result = await session.execute(stmt)

    options = []
    seen_items = set()
    for bom, item, beer, product in result.all():
        if item.id in seen_items:
            continue

        seen_items.add(item.id)
        options.append(
            ProductionItemOptionSchema(
                id=item.id,
                name=item.name,
                type="beer" if beer is not None else "product",
                bom=ProductionBomOptionSchema(
                    id=bom.id,
                    version=bom.version,
                    lines=[
                        ProductionBomLineOptionSchema(
                            id=line.id,
                            component_item_id=line.component_item_id,
                            quantity=line.quantity,
                            uom=line.uom,
                            scrap_factor=line.scrap_factor,
                        )
                        for line in bom.lines
                    ],
                ),
            )
        )

    return options


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

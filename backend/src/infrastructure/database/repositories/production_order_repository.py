# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE PRODUCTION ORDER
# ══════════════════════════════════════════════════════════════════════════════
# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE PRODUCTION ORDER
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, update

from src.domain.entities.production_order import ProductionOrder, ProductionConsumption, ProductionOutput
from src.domain.repositories.production_order_repository import IProductionOrderRepository
from src.domain.value_objects.production_order_status import ProductionOrderStatus
from src.infrastructure.database.models.production_order_model import (
    ProductionOrderModel,
    ProductionConsumptionModel,
    ProductionOutputModel,
)


class ProductionOrderRepository(IProductionOrderRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Utilidades ────────────────────────────────────────────────

    @staticmethod
    def _consumption_to_entity(model: ProductionConsumptionModel) -> ProductionConsumption:
        return ProductionConsumption(
            id=model.id,
            production_order_id=model.production_order_id,
            item_id=model.item_id,
            lot_id=model.lot_id,
            quantity=Decimal(str(model.quantity)),
            created_at=model.created_at,
        )

    @staticmethod
    def _output_to_entity(model: ProductionOutputModel) -> ProductionOutput:
        return ProductionOutput(
            id=model.id,
            production_order_id=model.production_order_id,
            item_id=model.item_id,
            lot_id=model.lot_id,
            quantity=Decimal(str(model.quantity)),
            created_at=model.created_at,
        )

    @staticmethod
    def _to_entity(model: ProductionOrderModel) -> ProductionOrder:
        order = ProductionOrder(
            id=model.id,
            item_id=model.item_id,
            bom_id=model.bom_id,
            planned_quantity=Decimal(str(model.planned_quantity)),
            produced_quantity=Decimal(str(model.produced_quantity)),
            status=ProductionOrderStatus(model.status),
            schedule_date=model.schedule_date,
            completed_at=model.completed_at,
            description=model.description,
            created_at=model.created_at,
        )
        order.consumptions = [ProductionOrderRepository._consumption_to_entity(c) for c in model.consumptions]
        order.outputs      = [ProductionOrderRepository._output_to_entity(o) for o in model.outputs]
        return order

    def _load_options(self):
        return [
            selectinload(ProductionOrderModel.consumptions),
            selectinload(ProductionOrderModel.outputs),
        ]

    # ── Queries ────────────────────────────────────────────────

    async def get_by_id(self, order_id: int) -> Optional[ProductionOrder]:
        stmt = (
            select(ProductionOrderModel)
            .where(ProductionOrderModel.id == order_id)
            .options(*self._load_options())
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_all(self) -> list[ProductionOrder]:
        stmt = select(ProductionOrderModel).options(*self._load_options())
        result = await self._session.execute(stmt)
        models = result.scalars().all()

        return [self._to_entity(model) for model in models]

    # ── Commands ────────────────────────────────────────────────

    async def add(self, order: ProductionOrder) -> ProductionOrder:
        """
        Persiste una nueva orden en estado PLANNED.
        """
        model = ProductionOrderModel(
            item_id=order.item_id,
            bom_id=order.bom_id,
            planned_quantity=order.planned_quantity,
            produced_quantity=order.produced_quantity,
            status=order.status.value,
            schedule_date=order.schedule_date,
            description=order.description,
            created_at=order.created_at,
        )
        self._session.add(model)
        await self._session.flush()

        order.id = model.id
        order.created_at = model.created_at
        return order

    async def save(self, order: ProductionOrder) -> ProductionOrder:
        """
        Persiste cambios de estado en una orden existente.
        """
        stmt = (
            update(ProductionOrderModel)
            .where(ProductionOrderModel.id == order.id)
            .values(
                status=order.status.value,
                produced_quantity=order.produced_quantity,
                completed_at=order.completed_at,
            )
        )
        await self._session.execute(stmt)
        await self._session.flush()
        return order

    async def add_consumptions(self, order: ProductionOrder) -> None:
        """
        Persiste los registros de consumption de la orden.
        Se llama al pasar a IN_PROGRESS.
        """
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        for consumption in order.consumptions:
            model = ProductionConsumptionModel(
                production_order_id=order.id,
                item_id=consumption.item_id,
                lot_id=consumption.lot_id,
                quantity=consumption.quantity,
                created_at=now,
            )
            self._session.add(model)

        await self._session.flush()

    async def add_outputs(self, order: ProductionOrder) -> None:
        """
        Persiste los registros de output de la orden.
        Se llama al pasar a DONE.
        """
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        for output in order.outputs:
            model = ProductionOutputModel(
                production_order_id=order.id,
                item_id=output.item_id,
                lot_id=output.lot_id,
                quantity=output.quantity,
                created_at=now,
            )
            self._session.add(model)

        await self._session.flush()
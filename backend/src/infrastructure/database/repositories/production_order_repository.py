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
from src.infrastructure.database.models.bom_model import BomModel
from src.infrastructure.database.models.item_model import ItemModel
from src.infrastructure.database.models.uom_model import UomModel

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
        Usa ORM-level update para que el identity map se mantenga sincronizado.
        """
        model = await self._session.get(ProductionOrderModel, order.id)
        if model is None:
            raise ValueError(f"ProductionOrderModel with id={order.id} not found in session")

        model.status = order.status.value
        model.produced_quantity = order.produced_quantity
        model.completed_at = order.completed_at
        model.description = order.description
        await self._session.flush()
        return order

    async def add_consumptions(self, order: ProductionOrder) -> None:
        """
        Persiste los registros de consumption de la orden.
        Se llama al ejecutar la orden.
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
        Se llama al completar la orden.
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

    async def get_all_incomplete(self) -> list[dict]:
        """
        Obtiene todas las órdenes de producción incompletas incluyendo 
        el nombre del producto y la versión de la receta.
        """
        stmt = (
            select(
                ProductionOrderModel.id,
                ItemModel.name.label("item_name"),    
                BomModel.version.label("bom_version"),
                ProductionOrderModel.planned_quantity,
                UomModel.symbol.label("base_uom_symbol"),
                ProductionOrderModel.schedule_date,
                ProductionOrderModel.status,
                ProductionOrderModel.bom_id,
            )
            .join(ItemModel, ProductionOrderModel.item_id == ItemModel.id)
            .join(BomModel, ProductionOrderModel.bom_id == BomModel.id)
            .join(UomModel, ItemModel.base_uom_id == UomModel.id)
            .where(
                ProductionOrderModel.status.in_(["PLANNED"])
            )
        )

        result = await self._session.execute(stmt)
        rows = result.all()

        return [
            {
                "id": row.id,
                "item_name": row.item_name,
                "bom_version": row.bom_version,
                "planned_quantity": row.planned_quantity,
                "base_uom_symbol": row.base_uom_symbol,
                "schedule_date": row.schedule_date,
                "status": row.status,
                "bom_id": row.bom_id,
            }
            for row in rows
        ]

    async def get_all_not_planned(self) -> list[dict]:
        """
        Obtiene todas las órdenes de producción que no están en estado PLANNED
        (historial de cocciones), incluyendo el nombre del producto y la
        versión de la receta. La cantidad reportada es la producida.
        """
        stmt = (
            select(
                ProductionOrderModel.id,
                ItemModel.name.label("item_name"),
                BomModel.version.label("bom_version"),
                ProductionOrderModel.produced_quantity,
                UomModel.symbol.label("base_uom_symbol"),
                ProductionOrderModel.schedule_date,
                ProductionOrderModel.status,
                ProductionOrderModel.bom_id,
            )
            .join(ItemModel, ProductionOrderModel.item_id == ItemModel.id)
            .join(BomModel, ProductionOrderModel.bom_id == BomModel.id)
            .join(UomModel, ItemModel.base_uom_id == UomModel.id)
            .where(
                ProductionOrderModel.status.notin_(["PLANNED"])
            )
        )

        result = await self._session.execute(stmt)
        rows = result.all()

        return [
            {
                "id": row.id,
                "item_name": row.item_name,
                "bom_version": row.bom_version,
                "produced_quantity": row.produced_quantity,
                "base_uom_symbol": row.base_uom_symbol,
                "schedule_date": row.schedule_date,
                "status": row.status,
                "bom_id": row.bom_id,
            }
            for row in rows
        ]

    async def delete(self, order_id: int) -> None:
        """
        Elimina una orden de producción por su ID incluyendo
        consumptions y outputs (cascade).
        """
        from sqlalchemy import delete as sql_delete

        stmt = sql_delete(ProductionOrderModel).where(
            ProductionOrderModel.id == order_id
        )
        await self._session.execute(stmt)
        await self._session.flush()
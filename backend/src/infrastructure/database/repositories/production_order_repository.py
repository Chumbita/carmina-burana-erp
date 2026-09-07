# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE PRODUCTION ORDER
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, update

from src.infrastructure.database.pagination import paginate

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
from src.infrastructure.database.models.inventory_lot_model import InventoryLotModel

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

    async def get_detailed_production_order_by_id(self, order_id: int) -> Optional[dict]:
        """
        Obtiene una orden de producción por su ID con toda la información detallada:
        header con nombre del producto, versión del BOM y símbolo de la UM base,
        más sus consumptions y outputs con nombre de item y código de lote.
        """
        stmt = (
            select(
                ProductionOrderModel.id,
                ProductionOrderModel.item_id,
                ItemModel.name.label("item_name"),
                ProductionOrderModel.bom_id,
                BomModel.version.label("bom_version"),
                ProductionOrderModel.planned_quantity,
                ProductionOrderModel.produced_quantity,
                ProductionOrderModel.status,
                UomModel.symbol.label("base_uom_symbol"),
                ProductionOrderModel.schedule_date,
                ProductionOrderModel.completed_at,
                ProductionOrderModel.description,
                ProductionOrderModel.created_at,
            )
            .join(ItemModel, ProductionOrderModel.item_id == ItemModel.id)
            .join(BomModel, ProductionOrderModel.bom_id == BomModel.id)
            .join(UomModel, ItemModel.base_uom_id == UomModel.id)
            .where(ProductionOrderModel.id == order_id)
        )

        result = await self._session.execute(stmt)
        header = result.first()

        if header is None:
            return None

        consumptions_stmt = (
            select(
                ProductionConsumptionModel.id,
                ProductionConsumptionModel.item_id,
                ItemModel.name.label("item_name"),
                ProductionConsumptionModel.lot_id,
                InventoryLotModel.lot_code.label("lot_code"),
                ProductionConsumptionModel.quantity,
                UomModel.symbol.label("uom_symbol"),
            )
            .join(ItemModel, ProductionConsumptionModel.item_id == ItemModel.id)
            .join(InventoryLotModel, ProductionConsumptionModel.lot_id == InventoryLotModel.id)
            .outerjoin(UomModel, ItemModel.base_uom_id == UomModel.id)
            .where(ProductionConsumptionModel.production_order_id == order_id)
            .order_by(ProductionConsumptionModel.id)
        )

        consumptions_result = await self._session.execute(consumptions_stmt)

        outputs_stmt = (
            select(
                ProductionOutputModel.id,
                ProductionOutputModel.item_id,
                ItemModel.name.label("item_name"),
                ProductionOutputModel.lot_id,
                InventoryLotModel.lot_code.label("lot_code"),
                ProductionOutputModel.quantity,
                InventoryLotModel.unit_cost.label("unit_cost"),
                UomModel.symbol.label("uom_symbol"),
            )
            .join(ItemModel, ProductionOutputModel.item_id == ItemModel.id)
            .join(InventoryLotModel, ProductionOutputModel.lot_id == InventoryLotModel.id)
            .outerjoin(UomModel, ItemModel.base_uom_id == UomModel.id)
            .where(ProductionOutputModel.production_order_id == order_id)
            .order_by(ProductionOutputModel.id)
        )

        outputs_result = await self._session.execute(outputs_stmt)

        return {
            "id": header.id,
            "item_id": header.item_id,
            "item_name": header.item_name,
            "bom_id": header.bom_id,
            "bom_version": header.bom_version,
            "planned_quantity": header.planned_quantity,
            "produced_quantity": header.produced_quantity,
            "status": header.status,
            "base_uom_symbol": header.base_uom_symbol,
            "schedule_date": header.schedule_date,
            "completed_at": header.completed_at,
            "description": header.description,
            "created_at": header.created_at,
            "consumptions": [
                {
                    "id": consumption.id,
                    "item_id": consumption.item_id,
                    "item_name": consumption.item_name,
                    "lot_id": consumption.lot_id,
                    "lot_code": consumption.lot_code,
                    "quantity": consumption.quantity,
                    "uom_symbol": consumption.uom_symbol,
                }
                for consumption in consumptions_result.all()
            ],
            "outputs": [
                {
                    "id": output.id,
                    "item_id": output.item_id,
                    "item_name": output.item_name,
                    "lot_id": output.lot_id,
                    "lot_code": output.lot_code,
                    "quantity": output.quantity,
                    "unit_cost": output.unit_cost,
                    "uom_symbol": output.uom_symbol,
                }
                for output in outputs_result.all()
            ],
        }

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
        Persiste cambios en una orden existente
        (status, cantidades, fechas y descripción).
        Usa ORM-level update para que el identity map se mantenga sincronizado.
        """
        model = await self._session.get(ProductionOrderModel, order.id)
        if model is None:
            raise ValueError(f"ProductionOrderModel with id={order.id} not found in session")

        model.status = order.status.value
        model.planned_quantity = order.planned_quantity
        model.produced_quantity = order.produced_quantity
        model.schedule_date = order.schedule_date
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
                ProductionOrderModel.completed_at,
                ProductionOrderModel.status,
                ProductionOrderModel.bom_id,
            )
            .join(ItemModel, ProductionOrderModel.item_id == ItemModel.id)
            .join(BomModel, ProductionOrderModel.bom_id == BomModel.id)
            .join(UomModel, ItemModel.base_uom_id == UomModel.id)
            .where(
                ProductionOrderModel.status.notin_(["PLANNED"])
            )
            .order_by(
                ProductionOrderModel.completed_at.desc().nulls_last(),
                ProductionOrderModel.schedule_date.desc(),
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
                "completed_at": row.completed_at,
                "status": row.status,
                "bom_id": row.bom_id,
            }
            for row in rows
        ]

    async def list_incomplete_paginated(
        self,
        *,
        offset: int,
        limit: int,
        q: str | None = None,
        sort_by: str = "schedule_date",
        sort_order: str = "asc",
    ) -> tuple[list[dict], int]:
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
            .where(ProductionOrderModel.status.in_(["PLANNED"]))
        )

        if q:
            escaped = q.strip().replace("%", "%%").replace("_", "\\_")
            like = f"%{escaped}%"
            stmt = stmt.where(ItemModel.name.ilike(like))

        sort_dir = sort_order.strip().lower() if sort_order else "asc"
        is_desc = sort_dir == "desc"

        order_col = ProductionOrderModel.schedule_date
        stmt = stmt.order_by(order_col.desc() if is_desc else order_col.asc())

        rows, total = await paginate(self._session, stmt, offset=offset, limit=limit)

        data = [
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

        return data, total

    async def list_history_paginated(
        self,
        *,
        offset: int,
        limit: int,
        q: str | None = None,
        status: str | None = None,
        date_field: str | None = None,
        date_from: str | None = None,
        date_to: str | None = None,
        sort_by: str = "production_date",
        sort_order: str = "desc",
    ) -> tuple[list[dict], int]:
        stmt = (
            select(
                ProductionOrderModel.id,
                ItemModel.name.label("item_name"),
                BomModel.version.label("bom_version"),
                ProductionOrderModel.produced_quantity,
                UomModel.symbol.label("base_uom_symbol"),
                ProductionOrderModel.schedule_date,
                ProductionOrderModel.completed_at,
                ProductionOrderModel.status,
                ProductionOrderModel.bom_id,
            )
            .join(ItemModel, ProductionOrderModel.item_id == ItemModel.id)
            .join(BomModel, ProductionOrderModel.bom_id == BomModel.id)
            .join(UomModel, ItemModel.base_uom_id == UomModel.id)
            .where(ProductionOrderModel.status.notin_(["PLANNED"]))
        )

        if q:
            escaped = q.strip().replace("%", "%%").replace("_", "\\_")
            like = f"%{escaped}%"
            stmt = stmt.where(ItemModel.name.ilike(like))

        if status:
            stmt = stmt.where(ProductionOrderModel.status == status.strip().upper())

        if date_field:
            date_col = (
                ProductionOrderModel.schedule_date
                if date_field == "schedule_date"
                else ProductionOrderModel.completed_at
            )

            if date_from:
                dt_from = datetime.fromisoformat(date_from) if "T" in date_from else datetime.combine(datetime.fromisoformat(date_from).date(), datetime.min.time())
                stmt = stmt.where(date_col >= dt_from)
            if date_to:
                dt_to = datetime.fromisoformat(date_to) if "T" in date_to else datetime.combine(datetime.fromisoformat(date_to).date(), datetime.max.time().replace(tzinfo=None))
                stmt = stmt.where(date_col <= dt_to)

        sort_dir = sort_order.strip().lower() if sort_order else "desc"
        is_desc = sort_dir == "desc"

        order_col = ProductionOrderModel.completed_at
        stmt = stmt.order_by(order_col.desc().nulls_last() if is_desc else order_col.asc().nulls_last())

        rows, total = await paginate(self._session, stmt, offset=offset, limit=limit)

        data = [
            {
                "id": row.id,
                "item_name": row.item_name,
                "bom_version": row.bom_version,
                "produced_quantity": row.produced_quantity,
                "base_uom_symbol": row.base_uom_symbol,
                "schedule_date": row.schedule_date,
                "completed_at": row.completed_at,
                "status": row.status,
                "bom_id": row.bom_id,
            }
            for row in rows
        ]

        return data, total

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
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.domain.entities.supply_entry import SupplyEntryOrder, SupplyEntryLine
from src.domain.value_objects.supply_entry_status import SupplyEntryStatus
from src.domain.repositories.supply_entry_repository import (
    ISupplyEntryRepository,
    SupplyEntryDetailData,
    SupplyEntryLineDetailData,
    SupplyEntryListItemData,
)
from src.infrastructure.database.models.supplier_model import SupplierModel
from src.infrastructure.database.models.item_model import ItemModel
from src.infrastructure.database.models.brand_model import BrandModel
from src.infrastructure.database.models.supply_entry_order_model import SupplyEntryOrderModel
from src.infrastructure.database.models.supply_entry_line_model import SupplyEntryLineModel


class SupplyEntryRepository(ISupplyEntryRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Mappers ──────────────────────────────────────────────────

    @staticmethod
    def _order_to_entity(model: SupplyEntryOrderModel) -> SupplyEntryOrder:
        return SupplyEntryOrder(
            id=model.id,
            supplier_id=model.supplier_id,
            document_number=model.document_number,
            entry_date=model.entry_date,
            description=model.description,
            status=SupplyEntryStatus(model.status),
            created_at=model.created_at,
        )

    @staticmethod
    def _order_to_model(entity: SupplyEntryOrder) -> SupplyEntryOrderModel:
        return SupplyEntryOrderModel(
            supplier_id=entity.supplier_id,
            document_number=entity.document_number,
            entry_date=entity.entry_date,
            description=entity.description,
            status=entity.status.value,
            created_at=entity.created_at,
        )

    @staticmethod
    def _line_to_entity(model: SupplyEntryLineModel) -> SupplyEntryLine:
        return SupplyEntryLine(
            id=model.id,
            item_id=model.item_id,
            quantity=model.quantity,
            unit_cost=model.unit_cost,
            expiration_date=model.expiration_date,
            lot_code=model.lot_code,
            comment=model.comment,
        )

    @staticmethod
    def _line_to_model(entity: SupplyEntryLine, supply_entry_id: int) -> SupplyEntryLineModel:
        return SupplyEntryLineModel(
            supply_entry_id=supply_entry_id,
            item_id=entity.item_id,
            quantity=entity.quantity,
            unit_cost=entity.unit_cost,
            expiration_date=entity.expiration_date,
            lot_code=entity.lot_code,
            comment=entity.comment,
        )

    # ── Commands ─────────────────────────────────────────────────

    async def add_order(self, order: SupplyEntryOrder) -> SupplyEntryOrder:
        model = self._order_to_model(order)
        self._session.add(model)
        await self._session.flush()
        order.id = model.id
        return order

    async def add_line(self, line: SupplyEntryLine, supply_entry_id: int) -> None:
        model = self._line_to_model(line, supply_entry_id)
        self._session.add(model)
        await self._session.flush()

    # ── Queries ──────────────────────────────────────────────────

    async def find_by_id(self, entry_id: int) -> Optional[SupplyEntryDetailData]:
        stmt_order = select(
            SupplyEntryOrderModel,
            SupplierModel.name.label("supplier_name"),
            SupplierModel.phone.label("supplier_phone"),
        ).outerjoin(
            SupplierModel,
            SupplyEntryOrderModel.supplier_id == SupplierModel.id,
        ).where(SupplyEntryOrderModel.id == entry_id)

        result = await self._session.execute(stmt_order)
        row = result.one_or_none()

        if row is None:
            return None

        order_model, supplier_name, supplier_phone = row

        stmt_lines = select(
            SupplyEntryLineModel,
            ItemModel.name.label("item_name"),
            BrandModel.name.label("brand_name"),
        ).join(
            ItemModel,
            SupplyEntryLineModel.item_id == ItemModel.id,
        ).outerjoin(
            BrandModel,
            ItemModel.brand_id == BrandModel.id,
        ).where(
            SupplyEntryLineModel.supply_entry_id == entry_id,
        ).order_by(SupplyEntryLineModel.id)

        result_lines = await self._session.execute(stmt_lines)
        line_rows = result_lines.all()

        lines = [
            SupplyEntryLineDetailData(
                item_id=line_model.item_id,
                item_name=item_name,
                brand_name=brand_name,
                quantity=line_model.quantity,
                unit_cost=line_model.unit_cost,
                expiration_date=line_model.expiration_date,
                lot_code=line_model.lot_code,
                lot_id=line_model.id,
                comment=line_model.comment,
            )
            for line_model, item_name, brand_name in line_rows
        ]

        return SupplyEntryDetailData(
            id=order_model.id,
            document_number=order_model.document_number,
            supplier_id=order_model.supplier_id,
            supplier_name=supplier_name,
            supplier_phone=supplier_phone,
            entry_date=order_model.entry_date,
            description=order_model.description,
            status=order_model.status,
            created_at=order_model.created_at,
            lines=lines,
        )

    async def find_all(self) -> list[SupplyEntryListItemData]:
        line_stats = select(
            SupplyEntryLineModel.supply_entry_id,
            func.count(SupplyEntryLineModel.id).label("items_count"),
            func.sum(
                SupplyEntryLineModel.quantity * SupplyEntryLineModel.unit_cost
            ).label("total_cost"),
        ).group_by(SupplyEntryLineModel.supply_entry_id).subquery()

        stmt = select(
            SupplyEntryOrderModel,
            SupplierModel.name.label("supplier_name"),
            line_stats.c.items_count,
            line_stats.c.total_cost,
        ).outerjoin(
            SupplierModel,
            SupplyEntryOrderModel.supplier_id == SupplierModel.id,
        ).outerjoin(
            line_stats,
            SupplyEntryOrderModel.id == line_stats.c.supply_entry_id,
        ).order_by(SupplyEntryOrderModel.created_at.desc())

        result = await self._session.execute(stmt)
        rows = result.all()

        return [
            SupplyEntryListItemData(
                id=order_model.id,
                document_number=order_model.document_number,
                supplier_id=order_model.supplier_id,
                supplier_name=supplier_name,
                entry_date=order_model.entry_date,
                description=order_model.description,
                status=order_model.status,
                created_at=order_model.created_at,
                items_count=items_count or 0,
                total_cost=total_cost or Decimal("0"),
            )
            for order_model, supplier_name, items_count, total_cost in rows
        ]

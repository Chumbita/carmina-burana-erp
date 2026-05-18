from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.domain.entities.supply_entry import SupplyEntryOrder, SupplyEntryLine
from src.domain.value_objects.supply_entry_status import SupplyEntryStatus
from src.domain.repositories.supply_entry_repository import ISupplyEntryRepository
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

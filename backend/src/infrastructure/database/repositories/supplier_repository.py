from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities.supplier import Supplier
from src.domain.value_objects.supplier_status import SupplierStatus
from src.domain.repositories.supplier_repository import ISupplierRepository
from src.infrastructure.database.models.supplier_model import SupplierModel


class SupplierRepository(ISupplierRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Mappers ──────────────────────────────────────────────────

    @staticmethod
    def _to_entity(model: SupplierModel) -> Supplier:
        return Supplier(
            id=model.id,
            name=model.name,
            email=model.email,
            phone=model.phone,
            address=model.address,
            status=SupplierStatus(model.status),
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _to_model(supplier: Supplier) -> SupplierModel:
        return SupplierModel(
            name=supplier.name,
            email=supplier.email,
            phone=supplier.phone,
            address=supplier.address,
            status=supplier.status.value,
            created_at=supplier.created_at or datetime.now(timezone.utc).replace(tzinfo=None),
            updated_at=supplier.updated_at or supplier.created_at,
        )

    # ── Commands ─────────────────────────────────────────────────

    async def add(self, supplier: Supplier) -> Supplier:
        model = self._to_model(supplier)
        self._session.add(model)
        await self._session.flush()
        return self._to_entity(model)

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, select

from src.infrastructure.database.pagination import paginate

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

    # ── Queries ──────────────────────────────────────────────────

    async def find_by_name(self, name: str) -> Supplier | None:
        stmt = select(SupplierModel).where(SupplierModel.name == name)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def find_by_id(self, supplier_id: int) -> Supplier | None:
        stmt = select(SupplierModel).where(SupplierModel.id == supplier_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def find_all(
        self,
        offset: int | None = None,
        limit: int | None = None,
        q: str | None = None,
        status: str | None = None,
    ) -> tuple[list[Supplier], int]:
        stmt = select(SupplierModel).order_by(SupplierModel.id)

        if q:
            like = f"%{q.strip()}%"
            stmt = stmt.where(
                or_(
                    SupplierModel.name.ilike(like),
                    SupplierModel.email.ilike(like),
                    SupplierModel.phone.ilike(like),
                )
            )

        if status and status != "all":
            stmt = stmt.where(SupplierModel.status == status)

        if offset is not None and limit is not None:
            rows, total = await paginate(self._session, stmt, offset=offset, limit=limit)
            models = [row[0] for row in rows]
            return [self._to_entity(m) for m in models], total

        result = await self._session.execute(stmt)
        models = list(result.scalars().all())
        return [self._to_entity(m) for m in models], len(models)

    async def find_active(self) -> list[Supplier]:
        stmt = (
            select(SupplierModel)
            .where(SupplierModel.status == SupplierStatus.ACTIVE.value)
            .order_by(SupplierModel.name)
        )
        result = await self._session.execute(stmt)
        return [self._to_entity(model) for model in result.scalars().all()]

    async def save(self, supplier: Supplier) -> Supplier:
        stmt = select(SupplierModel).where(SupplierModel.id == supplier.id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        if model is None:
            return None

        model.name = supplier.name
        model.email = supplier.email
        model.phone = supplier.phone
        model.address = supplier.address
        model.status = supplier.status.value
        model.updated_at = supplier.updated_at or datetime.now(timezone.utc).replace(tzinfo=None)
        await self._session.flush()
        return self._to_entity(model)

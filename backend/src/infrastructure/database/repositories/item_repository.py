# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE ITEM
# ══════════════════════════════════════════════════════════════════════════════

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.domain.entities.item import Item
from src.infrastructure.database.models.item_model import ItemModel
from src.infrastructure.database.models.item_type_model import ItemTypeModel


class ItemRepository:
    def __init__(self, session: AsyncSession):
        self._session = session
        
        
    # ── Utilidades ────────────────────────────────────────────────
    
    @staticmethod
    def _to_entity(model: ItemModel) -> Item:

        item = Item(
            id=model.id,
            name=model.name,
            item_type_id=model.item_type_id,
            brand_id=model.brand_id,
            base_uom_id=model.base_uom_id,
            min_stock_level=float(model.min_stock_level),
            is_stockable=model.is_stockable,
            is_batch_tracked=model.is_batch_tracked,
            is_manufacturable=model.is_manufacturable,
            is_purchasable=model.is_purchasable,
            is_sellable=model.is_sellable,
            status=model.status,
            created_at=model.created_at,
            updated_at=model.updated_at,
            deleted_at=model.deleted_at
        )
        
        return item

    @staticmethod
    def _to_model(item: Item) -> ItemModel:

        return ItemModel(
            name=item.name,
            item_type_id=item.item_type_id,
            brand_id=item.brand_id,
            base_uom_id=item.base_uom_id,
            is_stockable=item.is_stockable,
            is_batch_tracked=item.is_batch_tracked,
            min_stock_level=item.min_stock_level,
            is_manufacturable=item.is_manufacturable,
            is_purchasable=item.is_purchasable,
            is_sellable=item.is_sellable,
            status=item.status,
            created_at=item.created_at,
            updated_at=item.updated_at,
            deleted_at=item.deleted_at
        )

    # ── Commands ────────────────────────────────────────────────

    async def add(self, item: Item) -> Item:
        """
        Inserta un nuevo Item en la base de datos y devuelve la entidad con su ID asignado.

        - Convierte la entidad de dominio en un modelo SQLAlchemy.
        - Lo agrega a la sesión y hace flush (sin commit).
        - El flush obtiene el ID generado por la DB.
        - Ese ID se copia al objeto de dominio y se retorna.
        """
        model = ItemModel(
            name=item.name,
            item_type_id=item.item_type_id,
            brand_id=item.brand_id,
            base_uom_id=item.base_uom_id,
            is_stockable=item.is_stockable,
            is_batch_tracked=item.is_batch_tracked,
            min_stock_level=item.min_stock_level,
            is_manufacturable=item.is_manufacturable,
            is_purchasable=item.is_purchasable,
            is_sellable=item.is_sellable,
            status=item.status.value,
            created_at=item.created_at,
        )
        self._session.add(model)
        await self._session.flush() 
        item.id = model.id
        return item
    
    async def save(self, item: Item) -> Item:
        stmt = select(ItemModel).where(ItemModel.id == item.id)
        result = await self._session.execute(stmt)
        model = result.scalar_one()

        model.name = item.name
        model.brand_id = item.brand_id
        model.base_uom_id = item.base_uom_id
        model.min_stock_level = item.min_stock_level
        model.is_manufacturable = item.is_manufacturable
        model.is_purchasable = item.is_purchasable
        model.is_sellable = item.is_sellable
        model.status = item.status.value if hasattr(item.status, 'value') else item.status
        model.updated_at = item.updated_at
        model.deleted_at = item.deleted_at

        await self._session.flush()
        return item

    # ── Queries ────────────────────────────────────────────────

    async def get_by_id(self, item_id: int) -> Optional[Item]:
        """
        Busca un ítem por su ID y lo devuelve como entidad de dominio.
        """
        stmt= select(ItemModel).where(ItemModel.id == item_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        
        return self._to_entity(model) if model else None

    async def get_by_name(self, name: str) -> Optional[Item]:
        """
        Busca un ítem por su nombre y lo devuelve como entidad de dominio.
        """
        stmt = select(ItemModel).where(ItemModel.name == name)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    # ── Business oriented queries ────────────────────────────────────────────────

    async def get_active_items(self) -> List[Item]:
        """
        Devuelve todos los ítems con estado ACTIVE.
        """
        stmt = select(ItemModel).where(ItemModel.status == "ACTIVE")
        result = await self.session.execute(stmt)

        return [self._to_domain(m) for m in result.scalars().all()]

    async def get_inactive_items(self) -> List[Item]:
        """
        Devuelve todos los ítems con estado INACTIVE.
        """
        stmt = select(ItemModel).where(ItemModel.status == "INACTIVE")
        result = await self.session.execute(stmt)

        return [self._to_domain(m) for m in result.scalars().all()]

    async def get_stockable_items(self) -> List[Item]:
        """
        Devuelve todos los ítems que son stockeables.
        """
        stmt = select(ItemModel).where(ItemModel.is_stockable == True)
        result = await self.session.execute(stmt)

        return [self._to_domain(m) for m in result.scalars().all()]
    
    async def get_manufacturable(self) -> list[Item]:
        """
        Obtiene todos los items marcados como manufacturables (no eliminados).
        """
        stmt = (
            select(
                ItemModel.id,
                ItemModel.name,
                ItemTypeModel.code.label("item_type_name")
            )
            .join(ItemTypeModel, ItemModel.item_type_id == ItemTypeModel.id)
            .where(
                ItemModel.is_manufacturable.is_(True),
                ItemModel.deleted_at.is_(None),
            )
        )
        result = await self._session.execute(stmt)
        rows = result.all()
        return [
            {"id": r.id, "name": r.name, "item_type_name": r.item_type_name}
            for r in rows
        ]
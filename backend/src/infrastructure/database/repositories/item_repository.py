from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.domain.entities.item import Item
from src.domain.repositories.item_repository import IItemRepostory
from src.infrastructure.database.models.item_model import ItemModel


class ItemRepository:

    def __init__(self, session: AsyncSession):
        self._session = session
        
    # ── Mappers ────────────────────────────────────────────────
    
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

    async def save(self, item: Item) -> Item:
        """
        Inserta el ítem y hace flush para obtener el ID generado por la DB.
        NO hace commit: eso lo maneja get_db_session al finalizar el request.
        Esto garantiza que item.id esté disponible para el SpecializedItemCreator
        antes de que la transacción se confirme.
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
        await self._session.flush()  # ← ID disponible, sin commit
        item.id = model.id
        return item
    
    async def update(self, item: Item) -> Item:
        result = await self._session.execute(
            select(ItemModel).where(ItemModel.id == item.id)
        )
        model = result.scalar_one()

        model.name = item.name
        model.brand_id = item.brand_id
        model.base_uom_id = item.base_uom_id
        model.min_stock_level = item.min_stock_level
        model.is_manufacturable = item.is_manufacturable
        model.is_purchasable = item.is_purchasable
        model.is_sellable = item.is_sellable
        model.status = item.status.value
        model.updated_at = item.updated_at
        model.deleted_at = item.deleted_at

        await self._session.flush()
        return item

    # ── Queries ────────────────────────────────────────────────

    async def get_by_id(self, item_id: int) -> Optional[Item]:
        stmt= select(ItemModel).where(ItemModel.id == item_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        
        return self._to_entity(model) if model else None

    async def get_by_name(self, name: str) -> Optional[Item]:
        stmt = select(ItemModel).where(ItemModel.name == name)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    # ── Business oriented queries ────────────────────────────────────────────────

    async def get_active_items(self) -> List[Item]:
        stmt = select(ItemModel).where(ItemModel.status == "ACTIVE")
        result = await self.session.execute(stmt)

        return [self._to_domain(m) for m in result.scalars().all()]

    async def get_inactive_items(self) -> List[Item]:
        stmt = select(ItemModel).where(ItemModel.status == "INACTIVE")
        result = await self.session.execute(stmt)

        return [self._to_domain(m) for m in result.scalars().all()]

    async def get_stockable_items(self) -> List[Item]:
        stmt = select(ItemModel).where(ItemModel.is_stockable == True)
        result = await self.session.execute(stmt)

        return [self._to_domain(m) for m in result.scalars().all()]

   
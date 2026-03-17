from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.domain.entities.product import Product
from src.infrastructure.database.models import ProductModel

class ProductRepository:
    def __init__(self, session: AsyncSession):
        self._session = session
        
    # ======================
    # MAPPERS METHODS
    # ======================
    @staticmethod
    def _to_model(product: Product) -> ProductModel:
        return ProductModel(
            id= product.id,
            name= product.name,
            product_type= product.product_type,
            unit= product.unit,
            is_active= product.is_active,
            created_at= product.created_at
        )
    
    @staticmethod
    def _to_entity(product: ProductModel) -> Product:
        return Product(
            id= product.id,
            name= product.name,
            product_type= product.product_type, 
            unit= product.unit,
            is_active= product.is_active,
            created_at= product.created_at
        )

    # ======================
    # READ METHODS
    # ======================
    
    # Read all
    async def find_all(self) -> List[Product]:
        stmt= select(ProductModel)
        result= await self._session.execute(stmt)
        rows= result.scalars().all()
        
        return [self._to_entity(row) for row in rows]
    
    # Read only active
    async def find_actives(self) -> List[Product]:
        stmt= select(ProductModel).where(ProductModel.is_active.is_(True))
        result= await self._session.execute(stmt)
        rows= result.scalars().all()
        
        return [self._to_entity(row) for row in rows]
    
    # Read by id
    async def find_by_id(self, id) -> Optional[Product]:
        stmt= select(ProductModel).where(ProductModel.id == id)
        result= await self._session.execute(stmt)
        row= result.scalar_one_or_none()
        
        return self._to_entity(row) if row else None
    
    # Read by name
    async def find_by_name(self, name) -> Optional[Product]:
        stmt= select(ProductModel).where(ProductModel.name == name)
        result= await self._session.execute(stmt)
        row= result.scalar_one_or_none()
        
        return self._to_entity(row) if row else None
    
    # ======================
    # CREATE METHOD
    # ======================
    async def create(self, product: Product) -> Product:
        model= self._to_model(product)
        model.id= None
        
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        
        return self._to_entity(model)
    
    # ======================
    # UPDATE METHOD
    # ======================
    async def update(self, product: Product) -> Optional[Product]:
        stmt= select(ProductModel).where(ProductModel.id == product.id)
        result= await self._session.execute(stmt)
        product_model= result.scalar_one_or_none()
        
        if product_model is None:
            return None
        
        product_model.name= product.name
        product_model.product_type= product.product_type
        product_model.unit= product.unit
        product_model.is_active= product.is_active
        
        await self._session.commit()
        await self._session.refresh(product_model)
        return self._to_entity(product_model)
    
    # ======================
    # DELETE METHOD
    # ======================
    async def delete(self, id: int) -> bool:
        stmt= select(ProductModel).where(ProductModel.id == id)
        result= await self._session.execute(stmt)
        row = result.scalar_one_or_none()
        
        if row is None:
            return False
        
        row.is_active = False
        await self._session.commit()
        return True
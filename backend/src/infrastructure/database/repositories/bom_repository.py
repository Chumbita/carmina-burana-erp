from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities.bom import Bom, BomItem
from src.infrastructure.database.models.bom_model import BomModel
from src.infrastructure.database.models.bom_item_model import BomItemModel

class BomRepository:
    def __init__(self, session: AsyncSession):
        self._session = session
        
    # ======================
    # MAPPERS METHODS
    # ======================
    @staticmethod
    def _to_model(bom: Bom) -> BomModel:
        bom_model = BomModel(
            id= bom.id,
            product_id= bom.product_id,
            version= bom.version,
            base_quantity= bom.base_quantity,
            base_unit= bom.base_unit,
            standard_yield_pct= bom.standard_yield_pct,
            is_active= bom.is_active,
            created_at= bom.created_at
        )
        
        # mapear los items
        bom_model.items = [
            BomItemModel(
                id= item.id,
                bom_id= bom.id,
                component_type= item.component_type,
                input_id= item.input_id,
                product_id= item.product_id,
                quantity= item.quantity
            )
            for item in bom.items
        ]
        
        return bom_model
    
    @staticmethod
    def _to_entity(bom: BomModel) -> Bom:
        bom_entity = Bom(
            id= bom.id,
            product_id= bom.product_id,
            version= bom.version,
            base_unit= bom.base_unit,
            base_quantity= bom.base_quantity,
            standard_yield_pct= bom.standard_yield_pct,
            is_active= bom.is_active,
            created_at= bom.created_at,
            items= [
                BomItem(
                id= item.id,
                component_type= item.component_type,
                input_id= item.input_id,
                product_id= item.product_id,
                quantity= item.quantity
            )
            for item in bom.items
            ]
        )
        
        return bom_entity

    # ======================
    # READ METHODS
    # ======================
    
    # Read all
    async def find_all(self) -> List[Bom]:
        stmt= select(BomModel).options(selectinload(BomModel.items))
        result= await self._session.execute(stmt)
        rows= result.scalars().all()
        
        return [self._to_entity(row) for row in rows]
    
    # Read only actives
    async def find_actives(self) -> List[Bom]:
        stmt= select(BomModel).where(BomModel.is_active.is_(True)).options(selectinload(BomModel.items))
        result= await self._session.execute(stmt)
        rows= result.scalars().all()
        
        return [self._to_entity(row) for row in rows]
    
    # Read by id
    async def find_by_id(self, id: int) -> Optional[Bom]:
        stmt= select(BomModel).where(BomModel.id == id).options(selectinload(BomModel.items))
        result= await self._session.execute(stmt)
        row= result.scalar_one_or_none()
        
        return self._to_entity(row) if row else None
    
    # ======================
    # CREATE METHOD
    # ======================
    async def create(self, bom: Bom) -> Bom:
        stmt= select(BomModel).where(BomModel.product_id == bom.product_id).order_by(BomModel.version.desc())
        result= await self._session.execute(stmt)
        last_bom = result.scalars().first()
        
        new_version= 1 if last_bom is None else last_bom.version + 1
        model= self._to_model(bom)
        model.id= None
        model.version= new_version
        
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        
        stmt = select(BomModel).where(BomModel.id == model.id).options(selectinload(BomModel.items))
        result = await self._session.execute(stmt)
        row = result.scalar_one()
        print(self._to_entity(row))
        return self._to_entity(row)
    
    # ======================
    # DELETE METHOD
    # ======================
    async def delete(self, id: int) -> bool:
        stmt= select(BomModel).where(BomModel.id == id)
        result= await self._session.execute(stmt)
        row= result.scalar_one_or_none()
        
        if row is None:
            return False
        
        row.is_active= False
        await self._session.commit()
        return True
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from dataclasses import asdict

from src.domain.repositories.input_repository import InputRepository
from src.domain.entities.input import Input
from src.infrastructure.database.models.input_model import InputModel
from src.infrastructure.database.models.input_inventory_model import InputInventoryModel
from src.infrastructure.database.models.input_entry_item_model import InputEntryItemModel


class InputRepositoryImpl(InputRepository):

    def __init__(self, db: AsyncSession):
        self.db = db

    # ======================
    # VALIDACIONES DB
    # ======================

    async def get_by_name(self, name: str) -> Optional[InputModel]:
        result = await self.db.execute(
            select(InputModel).where( InputModel.name == name )
        )
        return result.scalar_one_or_none()
    
    async def find_by_identity(
            self,
            name: str,
            brand: str | None,
            category: str | None,
            exclude_id: int | None = None,
        ) -> InputModel | None:

        conditions = [
            InputModel.name == name,
            InputModel.brand == brand,
            InputModel.category == category,
        ]

        if exclude_id is not None:
            conditions.append(InputModel.id != exclude_id)

        stmt = select(InputModel).where(and_(*conditions))

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    
    async def has_stock(self, input_id: int) -> bool:
        result = await self.db.execute(
            select(InputInventoryModel)
            .join(
                InputEntryItemModel,
                InputInventoryModel.id_entry_item == InputEntryItemModel.id
            )
            .where(
                InputEntryItemModel.id_input == input_id,
                InputInventoryModel.current_amount > 0,
                InputInventoryModel.status == True
            )
        )
        return result.first() is not None

    
    # ======================
    # MAPPERS
    # ======================
    def _to_entity(self, model: InputModel) -> Input:
        return Input(
            id=model.id,
            name=model.name,
            brand=model.brand,
            category=model.category,
            unit=model.unit,
            minimum_stock=model.minimum_stock,
            image=model.image,
            status=model.status,
        )
    

    # ======================
    # READ
    # ======================
    async def get_active_inputs(self) -> List[Input]:
        stmt = select(InputModel).where(InputModel.status == True)
        result = await self.db.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]


    async def get_input_by_id(self, input_id: int) -> Optional[Input]:
        model = await self.db.get(InputModel, input_id)
        return self._to_entity(model) if model else None

    # ======================
    # CREATE
    # ======================
    async def create(self, input: Input) -> Input:
        model = InputModel(
            name=input.name,
            brand=input.brand,
            category=input.category,
            unit=input.unit,
            minimum_stock=input.minimum_stock,
            image=input.image,
            status=input.status,
        )
        self.db.add(model)
        await self.db.commit()
        await self.db.refresh(model)
        return self._to_entity(model)

    # ======================
    # UPDATE
    # ======================

    async def update(self, input_id: int, data: dict):
        
        model = await self.db.get(InputModel, input_id)

        if not model:
            return None
        
        for field, value in data.items():
            setattr(model, field, value)

        await self.db.commit()
        await self.db.refresh(model)
        return self._to_entity(model)
    
    async def reactivate(self, model: InputModel) -> Input:
        model.status = True
        await self.db.commit()
        await self.db.refresh(model)
        return self._to_entity(model)


    # ======================
    # DELETE 
    # ======================
    async def delete(self, input_id: int) -> bool:
        model = await self.db.get(InputModel, input_id)
        if not model:
            return False
        
        model.status = False 
        await self.db.commit()
        return True
    

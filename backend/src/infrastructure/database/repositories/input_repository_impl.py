from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from dataclasses import asdict

from src.domain.repositories.input_repository import InputRepository
from src.domain.entities.input import Input
from src.infrastructure.database.models.input_model import InputModel


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
    
    # ======================
    # MAPPERS
    # ======================
    def _to_entity(self, model: InputModel) -> Input:
        return Input(
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
    async def get_all(self) -> List[Input]:
        stmt = select(InputModel).where(InputModel.status == True)
        result = await self.db.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def get_by_id(self, input_id: int) -> Optional[Input]:
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

    async def update(self, input_obj):
        print("⚠️ La función update todavía no está implementada")
        raise NotImplementedError("El método update aún no está implementado")


    """ async def update(self, input_id: int, input: Input) -> Optional[Input]:
        
        model = await self.db.get(InputModel, input_id)
        if not model:
            return None

        for key, value in asdict(input).items():
            setattr(model, key, value)

        await self.db.commit()
        await self.db.refresh(model)
        return self._to_entity(model) """

    # ======================
    # DELETE (soft delete recomendado)
    # ======================
    async def delete(self, input_id: int) -> bool:
        model = await self.db.get(InputModel, input_id)
        if not model:
            return False

        model.status = False
        await self.db.commit()
        return True
    

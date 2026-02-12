from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from src.domain.repositories.input_repository import InputRepository
from src.domain.entities.input import Input
from src.infrastructure.database.models.input_model import InputModel
from src.infrastructure.database.models.input_inventory_model import InputInventoryModel
from src.infrastructure.database.models.input_entry_item_model import InputEntryItemModel
from src.infrastructure.database.models.input_entry_model import InputEntryModel


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

        stmt =( 
            select(
                InputModel,
                func.coalesce(func.sum(InputInventoryModel.current_amount), 0).label("stock_total")      
            )
            .join(InputEntryItemModel, InputEntryItemModel.id_input == InputModel.id)
            .join(InputInventoryModel, (InputInventoryModel.id_entry_item == InputEntryItemModel.id) &
                  (InputInventoryModel.status == True) )
            .where(InputModel.status == True)
            .group_by(InputModel.id)
            )

        result = await self.db.execute(stmt)
        rows = result.all()
        return [
            (self._to_entity(row[0]), row[1])
            for row in rows
        ]

    async def get_input_by_id(self, input_id: int):

        # INPUT + STOCK TOTAL + LAST UPDATE

        stmt_input = (
            select(
                InputModel,
                func.coalesce(
                    func.sum(InputInventoryModel.current_amount), 0
                ).label("stock_total"),
                func.max(InputInventoryModel.updated_at).label("last_update"),
            )
            .outerjoin(
                InputEntryItemModel,
                InputEntryItemModel.id_input == InputModel.id,
            )
            .outerjoin(
                InputEntryModel, InputEntryModel.id 
                == InputEntryItemModel.id_entry
            )
            .outerjoin(
                InputInventoryModel,
                InputInventoryModel.id_entry_item
                == InputEntryItemModel.id,
            )
            .where(
                InputModel.id == input_id,
                InputModel.status == True,
            )
            .group_by(InputModel.id)
        )


    async def get_input_entity_by_id(self, input_id: int) -> Optional[Input]:
        model = await self.db.get(InputModel, input_id)
        return self._to_entity(model) if model else None
    
    async def get_input_by_id(self, input_id: int) -> Optional[Input]:
        model = await self.db.get(InputModel, input_id)
        return self._to_entity(model) if model else None
        result_input = await self.db.execute(stmt_input)
        input_row = result_input.first()

        if not input_row:
            return None, []

        input_obj, stock_total, last_update = input_row

        # LOTES

        stmt_lots = (
            select(
                InputEntryItemModel.id.label("lote_id"),
                InputEntryModel.entry_date,
                InputEntryItemModel.amount.label("cantidad_ingresada"),
                InputInventoryModel.current_amount,
                InputEntryItemModel.expire_date,
                InputInventoryModel.updated_at,
            )
            .join(
                InputEntryModel,
                InputEntryModel.id == InputEntryItemModel.id_entry
            )
            .join(
                InputInventoryModel,
                InputInventoryModel.id_entry_item
                == InputEntryItemModel.id,
            )
            .where(InputEntryItemModel.id_input == input_id)
        )

        result_lots = await self.db.execute(stmt_lots)
        lots = result_lots.all()

        return (
            {
                "input": input_obj,
                "stock_total": stock_total,
                "last_update": last_update,
            },
            lots,
        )

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
    

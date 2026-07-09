# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE LOTES
# ══════════════════════════════════════════════════════════════════════════════

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from src.domain.entities.inventory_lot import InventoryLot
from src.infrastructure.database.models.inventory_lot_model import InventoryLotModel

class InventoryLotRepository():
    def __init__(self, session: AsyncSession):
        self._session = session
        
    
    # --- Utilidades ---------------------------------------------
    
    @staticmethod
    def _to_model(entity: InventoryLot) -> InventoryLotModel:
        return InventoryLotModel(
            item_id=entity.item_id,
            lot_code=entity.lot_code,
            unit_cost=entity.unit_cost,
            expiration_date=entity.expiration_date,
            production_date=entity.production_date,
            created_at=entity.created_at,
        )
    
    @staticmethod
    def _to_entity(model: InventoryLotModel) -> InventoryLot:
        return InventoryLot(
            id=model.id,
            item_id=model.item_id,
            lot_code=model.lot_code,
            unit_cost=model.unit_cost,
            expiration_date=model.expiration_date,
            production_date=model.production_date,
            created_at=model.created_at,
        )
    
    
    # --- Comportamiento -------------------------------------------
    
    async def save(self, lot: InventoryLot) -> InventoryLot:
        """
        Operacion que internamente decide si insertar o actualizar un registro.
        
        Se utiliza el método "has_been_persisted()" de la entidad para indicar
        si ya tiene ID asignado y así poder decidir entre INSERT y UPDATE.
        """
        if not lot.has_been_persisted():
            lot_model = self._to_model(lot)
            
            self._session.add(lot_model)
            await self._session.flush()
            lot.id = lot_model.id
        else:
            # UPDATE sobre lote existente (si en algún momento se permite editar)
            stmt = (
                update(InventoryLotModel)
                .where(InventoryLotModel.id == lot.id)
                .values(
                    unit_cost=lot.unit_cost,
                    expiration_date=lot.expiration_date,
                    production_date=lot.production_date,
                )
            )
            await self._session.execute(stmt)

        return lot

    
    async def get_by_id(self, lot_id: int) -> Optional[InventoryLot]:
        """ 
        Busca un lote por su ID. Retorna None si no existe.
        """
        result = await self._session.get(InventoryLotModel, lot_id)
        if result is None:
            return None
        return self._to_entity(result)


    async def exists_by_code(self, item_id: int, lot_code: str) -> bool:
        stmt = select(InventoryLotModel.id).where(
            InventoryLotModel.item_id == item_id,
            InventoryLotModel.lot_code == lot_code,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def find_by_item_and_code(self, item_id: int, lot_code: str) -> Optional[InventoryLot]:
        stmt = select(InventoryLotModel).where(
            InventoryLotModel.item_id == item_id,
            InventoryLotModel.lot_code == lot_code,
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None
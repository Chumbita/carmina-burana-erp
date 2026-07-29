# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE LAS TRANSACCIONES DE INVENTARIO
# ══════════════════════════════════════════════════════════════════════════════

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.domain.entities.inventory_transaction import InventoryTransaction
from src.infrastructure.database.models.inventory_transaction_model import InventoryTransactionModel

class InventoryTransactionRepository():
    def __init__(self, session: AsyncSession):
        self._session = session
    
    # --- Utilidades ---------------------------------------------
    
    @staticmethod
    def _to_model(entity: InventoryTransaction) -> InventoryTransactionModel:
        return InventoryTransactionModel(
            item_id=entity.item_id,
            lot_id=entity.lot_id,
            quantity=entity.quantity,
            transaction_type=entity.transaction_type,
            reference_type=entity.reference_type,
            reference_id=entity.reference_id,
            created_at=entity.created_at,
        )
    
    @staticmethod
    def _to_entity(model: InventoryTransactionModel) -> InventoryTransaction:
        return InventoryTransaction(
            id=model.id,
            item_id=model.item_id,
            lot_id=model.lot_id,
            quantity=model.quantity,
            transaction_type=model.transaction_type,
            reference_type=model.reference_type,
            reference_id=model.reference_id,
            created_at=model.created_at,
        )
    
    # --- Comportamiento -----------------------------------------
    
    async def add(self, transaction: InventoryTransaction) -> None:
        """ 
        Persiste una transacción.
        """
        transaction_model = self._to_model(transaction)
        
        self._session.add(transaction_model)
        await self._session.flush()
    
    async def list_by_item(self, item_id: int) -> list[InventoryTransaction]:
        """
        Retorna todas las transacciones de inventario para un ítem,
        ordenadas por fecha descendente.
        """
        stmt = (
            select(InventoryTransactionModel)
            .where(InventoryTransactionModel.item_id == item_id)
            .order_by(InventoryTransactionModel.created_at.desc())
        )
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

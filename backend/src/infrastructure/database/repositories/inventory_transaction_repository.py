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
    def _to_model(entity: InventoryTransaction) -> None:
        return InventoryTransactionModel(
            item_id=entity.item_id,
            lot_id=entity.lot_id,
            quantity=entity.quantity,
            transaction_type=entity.transaction_type,
            reference_type=entity.reference_type,
            reference_id=entity.reference_id,
            created_at=entity.created_at,
        )
    
    
    # --- Comportamiento -----------------------------------------
    
    async def add(self, transaction: InventoryTransaction) -> None:
        """ 
        Persiste una transacción.
        """
        transaction_model = self._to_model(transaction)
        
        self._session.add(transaction_model)
        await self._session.flush()

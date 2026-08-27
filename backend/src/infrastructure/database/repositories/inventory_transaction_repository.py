# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE LAS TRANSACCIONES DE INVENTARIO
# ══════════════════════════════════════════════════════════════════════════════

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.domain.entities.inventory_transaction import InventoryTransaction
from src.infrastructure.database.models.inventory_transaction_model import InventoryTransactionModel
from src.infrastructure.database.pagination import paginate

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
            reason=entity.reason,
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
            reason=model.reason,
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
    
    async def list_by_item(
        self,
        item_id: int,
        offset: int | None = None,
        limit: int | None = None,
    ) -> tuple[list[InventoryTransaction], int]:
        """
        Retorna las transacciones de inventario para un ítem,
        ordenadas por fecha descendente, junto con el total.

        offset/limit: paginación opcional. El total se calcula sobre el
        mismo dataset filtrado por item_id.
        """
        stmt = (
            select(InventoryTransactionModel)
            .where(InventoryTransactionModel.item_id == item_id)
            .order_by(InventoryTransactionModel.created_at.desc())
        )

        if offset is not None and limit is not None:
            rows, total = await paginate(self._session, stmt, offset=offset, limit=limit)
        else:
            result = await self._session.execute(stmt)
            rows = result.all()
            total = len(rows)

        models = [row[0] for row in rows]
        return [self._to_entity(m) for m in models], total

# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DEL BALANCE DEL INVENTARIO
# ══════════════════════════════════════════════════════════════════════════════

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from decimal import Decimal

from src.domain.entities.inventory_balance import InventoryBalance
from src.infrastructure.database.models.inventory_balance_model import InventoryBalanceModel

class InventoryBalanceRepository():
    def __init__(self, session: AsyncSession):
        self._session = session
        
    # --- Utilidades ---------------------------------------------
    
    @staticmethod
    def _to_model(entity: InventoryBalance) -> InventoryBalanceModel:
        return InventoryBalanceModel(
            item_id=entity.item_id,
            lot_id=entity.lot_id,
            quantity=entity.quantity,
            reserved_quantity=entity.reserved_quantity,
            updated_at=entity.updated_at,
        )
    
    @staticmethod
    def _to_entity(model: InventoryBalanceModel) -> InventoryBalance:
        return InventoryBalance(
            item_id=model.item_id,
            lot_id=model.lot_id,
            quantity=model.quantity,
            reserved_quantity=model.reserved_quantity,
            updated_at=model.updated_at,
        )
    
    # --- Comportamiento -------------------------------------------
    
    async def get_by_lot(self, item_id: int, lot_id: int) -> Optional[InventoryBalance]:
        """
        SELECT FOR UPDATE garantiza que ninguna otra transacción concurrente
        pueda leer y modificar este mismo balance hasta que la transacción
        actual haga commit o rollback. Previene el clásico race condition
        de inventario: dos ventas simultáneas sobre el mismo lote.
        """
        stmt = (
            select(InventoryBalanceModel)
            .where(
                InventoryBalanceModel.item_id == item_id,
                InventoryBalanceModel.lot_id == lot_id,
            )
            .with_for_update()
        )
        result = await self._session.execute(stmt)
        balance_model = result.scalar_one_or_none()
        return self._to_entity(balance_model) if balance_model else None
    
    
    async def get_total_available_by_item(self, item_id: int) -> int | float:
        """
        Obtiene el stock disponible total para un ítem sumando los balances activos.
        """
        stmt = (
            select(InventoryBalanceModel.quantity, InventoryBalanceModel.reserved_quantity)
            .where(InventoryBalanceModel.item_id == item_id)
        )
        result = await self._session.execute(stmt)
        balances = result.all()
        return sum(Decimal(str(balance.quantity)) - Decimal(str(str(balance.reserved_quantity))) for balance in balances)

    async def save(self, balance: InventoryBalance) -> None:
        """
        Decide internamente entre INSERT y UPDATE.
        """
        existing = await self._session.get(InventoryBalanceModel, balance.lot_id)

        if existing is None:
            # Primera vez que se persiste este balance: INSERT
            model = self._to_model(balance)
            self._session.add(model)
        else:
            # Ya existe: UPDATE con los valores actuales de la entidad.
            # La entidad ya tiene el estado correcto tras apply_delta();
            # aquí simplemente lo persistimos.
            existing.quantity = balance.quantity
            existing.reserved_quantity = balance.reserved_quantity
            # Si balance.updated_at tiene zona horaria, se la removemos (.replace(tzinfo=None))
            if balance.updated_at and balance.updated_at.tzinfo is not None:
                existing.updated_at = balance.updated_at.replace(tzinfo=None)
            else:
                existing.updated_at = balance.updated_at

        await self._session.flush()
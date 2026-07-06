# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DEL BALANCE DE INVENTARIO
# ══════════════════════════════════════════════════════════════════════════════

from typing import Protocol, Optional

from src.domain.entities.inventory_balance import InventoryBalance

class IInventoryBalanceRepository(Protocol):

    async def get_by_lot(self, item_id: int, lot_id: int) -> InventoryBalance | None:
        """ 
        Obtiene el balance por lote.
        """
        ...

    async def get_total_available_by_item(self, item_id: int) -> int | float:
        """
        Obtiene el stock disponible total para un ítem.
        """
        ...

    async def save(self, balance: InventoryBalance) -> None:
        """
        Persiste el estado actual de la entidad:
        -> Se insertará un nuevo registro en caso de ser una entidad nueva.
        -> Se actualizará su registro en caso de que la entidad ya exista.
        """
        ...
# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE TRANSACCIONES DE INVENTARIO
# ══════════════════════════════════════════════════════════════════════════════

from typing import Protocol

from src.domain.entities.inventory_transaction import InventoryTransaction

class IInventoryTransactionRepository(Protocol):
     
     async def add(self, transaction: InventoryTransaction) -> None:
        """
        Método para registrar una transacción.
        """
        ...

     async def list_by_item(self, item_id: int) -> list[InventoryTransaction]:
        """
        Retorna todas las transacciones de inventario para un ítem,
        ordenadas por fecha descendente.
        """
        ...
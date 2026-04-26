# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE TRANSACCIONES DE INVENTARIO
# ══════════════════════════════════════════════════════════════════════════════

from typing import Protocol

from src.domain.entities.inventory_transaction import InventoryTransaction

class IInventoryTransaction(Protocol):
    
     async def add(self, transaction: InventoryTransaction) -> None:
        """
        Método para registrar una transacción.
        """
        ...
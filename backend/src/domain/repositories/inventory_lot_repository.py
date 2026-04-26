# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE LOTES
# ══════════════════════════════════════════════════════════════════════════════

from typing import Protocol

from src.domain.entities.inventory_lot import InventoryLot

class IInventoryLot(Protocol):
    
    async def save(self, lot: InventoryLot) -> InventoryLot:
        """
        Actualiza el estado de un lote.
        -> Se insertará un nuevo registro en caso de ser una entidad nueva.
        -> Se actualizará su registro en caso de que la entidad ya exista.
        """
        ...

    
    async def get_by_id(self, lot_id: int) -> InventoryLot | None:
        """
        Busca un lote por su ID. Retorna None si no existe.
        """
        ...

    
    async def exists_by_code(self, item_id: int, lot_code: str) -> bool:
        """
        Verifica si ya existe un lote con ese código para ese ítem.
        Usado para prevenir duplicados antes de intentar el INSERT.
        """
        ...
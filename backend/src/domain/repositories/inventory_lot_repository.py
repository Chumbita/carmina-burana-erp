# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE LOTES
# ══════════════════════════════════════════════════════════════════════════════

from typing import Protocol

from src.domain.entities.inventory_lot import InventoryLot

class IInventoryLotRepository(Protocol):
    
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

    async def get_available_by_item_fefo(self, item_id: int) -> list:
        """
        Devuelve los lotes disponibles de un ítem ordenados por
        expiration_date ASC (FEFO). Se usa en la fase de EXECUTION
        para seleccionar qué lotes consumir primero.
        """
        ...
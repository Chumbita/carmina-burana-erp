# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE LOTES
# ══════════════════════════════════════════════════════════════════════════════

from typing import Protocol, Optional

from src.domain.entities.inventory_lot import InventoryLot

class IInventoryLotRepository(Protocol):
    
    async def save(self, lot: InventoryLot) -> InventoryLot:
        ...

    async def get_by_id(self, lot_id: int) -> Optional[InventoryLot]:
        ...

    async def exists_by_code(self, item_id: int, lot_code: str) -> bool:
        ...

    async def find_by_item_and_code(self, item_id: int, lot_code: str) -> Optional[InventoryLot]:
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
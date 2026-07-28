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
        ...
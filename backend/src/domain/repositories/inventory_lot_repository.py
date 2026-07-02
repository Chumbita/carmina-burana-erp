# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE LOTES
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Protocol, Optional

from src.domain.entities.inventory_lot import InventoryLot
from src.domain.value_objects.lot_status import LotStatus


class IInventoryLotRepository(Protocol):
    
    async def save(self, lot: InventoryLot) -> InventoryLot:
        ...

    async def get_by_id(self, lot_id: int) -> Optional[InventoryLot]:
        ...

    async def exists_by_code(self, item_id: int, lot_code: str) -> bool:
        """
        Verifica si ya existe un lote con ese código para ese ítem.
        Usado para prevenir duplicados antes de intentar el INSERT.
        """
        ...

    async def find_by_item_and_code(self, item_id: int, lot_code: str) -> Optional[InventoryLot]:
        ...

    async def find_by_item_id(
        self,
        item_id: int,
        status: set[LotStatus] | None = None,
    ) -> list["ItemLots"]:
        """
        Busca lotes de un item con su información de balance.
        
        status:
          None → todos los lotes (sin filtro)
          set con uno o más LotStatus → combina condiciones con OR
          EXPIRING_SOON se ignora (solo es etiqueta informativa)
        """
        ...


# ── Dataclass de retorno ─────────────────────────────────────────

@dataclass
class ItemLots:
    """
    Datos de un lote con su información de balance.

    quantity y reserved_quantity vienen de la tabla inventory_balance.
    Si el lote no tiene balance registrado, se devuelven en 0.
    El campo status lo asigna el use case.
    """
    id: int
    item_id: int
    lot_code: str
    unit_cost: Decimal
    quantity: Decimal = Decimal("0")
    reserved_quantity: Decimal = Decimal("0")
    expiration_date: datetime | None = None
    production_date: datetime | None = None
    created_at: datetime | None = None
    status: str | None = None

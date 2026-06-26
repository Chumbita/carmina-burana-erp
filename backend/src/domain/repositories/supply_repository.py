# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE INSUMOS
# ══════════════════════════════════════════════════════════════════════════════

from typing import Any, Optional, Protocol
from src.domain.entities.supply import Supply

class ISupplyRepository(Protocol):
    
   # ── Comandos ────────────────────────────────────────────────
 
    async def add(self, supply: Supply) -> None:
        """
        Persiste un nuevo insumo.
        """
        ...

    async def save(self, supply: Supply) -> None:
        """
        Persiste los cambios de un insumo existente.
        """
        ...

    async def get_by_item_id(self, item_id: int) -> Optional[Supply]:
        """
        Obtiene un insumo por su item_id.
        """
        ...

    async def list_active_supplies_general(self) -> list[dict[str, Any]]:
        """
        Retorna la vista general de insumos activos.
        """
        ...

    async def get_active_supply_detail(self, item_id: int) -> Optional[dict[str, Any]]:
        """
        Retorna el detalle de un insumo activo o None si no existe.
        """
        ...

    async def has_stock(self, item_id: int) -> bool:
        """
        Retorna True si el insumo tiene stock disponible (quantity > 0).
        """
        ...

    async def soft_delete(self, item_id: int) -> bool:
        """
        Marca el item como DELETED (soft delete). Retorna True si se encontró y eliminó.
        """
        ...

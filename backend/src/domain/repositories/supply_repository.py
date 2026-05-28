# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE INSUMOS
# ══════════════════════════════════════════════════════════════════════════════

from typing import Any, Optional, Protocol
from src.domain.entities.supply import Supply

class ISupplyRepository(Protocol):
    
    async def add(self, supply: Supply) -> None:
        """
        Persiste un nuevo insumo.
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
        

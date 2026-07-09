# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE BOM
# ══════════════════════════════════════════════════════════════════════════════

from typing import Protocol, Optional
from src.domain.entities.bom import Bom


class IBomRepository(Protocol):

    # ── Comandos ────────────────────────────────────────────────

    async def add(self, bom: Bom) -> None:
        """
        Persiste un nuevo BOM con sus líneas en una única transacción.
        """
        ...

    async def save(self, bom: Bom) -> None:
        """
        Persiste los cambios de un BOM existente (closing version).
        """
        ...

    # ── Queries ────────────────────────────────────────────────

    async def get_by_id(self, bom_id: int) -> Optional[Bom]:
        """
        Obtiene un BOM por su ID.
        """
        ...

    async def get_by_parent_item_id(self, parent_item_id: int) -> Optional[Bom]:
        """
        Obtiene un BOM por el ID del ítem padre.
        """
        ...

    async def get_active_by_parent_item_id(self, parent_item_id: int) -> Optional[Bom]:
        """
        Obtiene el BOM activo para un ítem padre.
        Retorna None si no existe ningún BOM activo.
        """
        ...

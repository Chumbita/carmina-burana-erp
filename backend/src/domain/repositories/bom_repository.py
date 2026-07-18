# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE BOM
# ══════════════════════════════════════════════════════════════════════════════

from typing import Protocol, Optional
from src.domain.entities.bom import Bom


class IBomRepository(Protocol):

    async def get_by_id(self, bom_id: int) -> Optional[Bom]:
        """
        Obtiene un BOM por su ID.
        """
        ...

async def get_bom_by_item(self, item_id: int) -> Optional[dict]:
    """
    Obtiene la BOM activa de un item, con sus líneas, nombre de componente
    y unidad de medida resueltos. Devuelve None si no hay BOM activa.
    """
    ...
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

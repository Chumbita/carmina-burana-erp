# ════════════════════════════════════════════════════════════════════════
# INTERFAZ DE REPOSITORIO DE BRAND
# ════════════════════════════════════════════════════════════════════════

from typing import Protocol, Optional, List
from src.domain.entities.brand import Brand

class IBrandRepository(Protocol):

    async def get_all(self) -> List[Brand]:
        """
        Obtiene un listado de todas las marcas registradas.
        """
        ...

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

    async def delete(self, brand_id: int) -> bool:
        """
        Elimina una marca por su ID.
        Retorna True si se eliminó, False si no existía.
        """
        ...

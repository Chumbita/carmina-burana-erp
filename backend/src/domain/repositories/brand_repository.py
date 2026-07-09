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

    async def add(self, brand: Brand) -> Brand:
        """
        Agrega una nueva marca al repositorio.
        Retorna la entidad con el id generado.
        """
        ...

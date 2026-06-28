# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE BEER
# ══════════════════════════════════════════════════════════════════════════════

from typing import Protocol, Optional
from src.domain.entities.beer import Beer


class IBeerRepository(Protocol):

    async def get_by_item_id(self, item_id: int) -> Optional[Beer]:
        """
        Busca una cerveza por item_id y la devuelve como entidad de dominio.
        """
        ...

    async def get_all(self) -> list[Beer]:
        """
        Devuelve todas las cervezas como entidades de dominio.
        """
        ...

    async def add(self, beer: Beer) -> None:
        """
        Inserta una nueva cerveza en la base de datos.
        """
        ...

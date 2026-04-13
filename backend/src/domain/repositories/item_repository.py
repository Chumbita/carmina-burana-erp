from typing import Protocol, Optional, List
from src.domain.entities.item import Item

class IItemRepostory(Protocol):
    
    # ── Comandos ────────────────────────────────────────────────

    async def add(self, item: Item) -> None:
        """
        Persiste un nuevo ítem.
        """
        ...

    async def save(self, item: Item) -> None:
        """
        Persiste los cambios de un item existente.
        """
        ...

    # ── Queries ────────────────────────────────────────────────

    async def get_by_id(self, item_id: int) -> Optional[Item]:
        """
        Obtiene un item por su ID.
        """
        ...

    async def get_by_name(self, name: str) -> Optional[Item]:
        """
        Obtiene un tiem por su nombre.
        """
        ...


    # ── Business oriented queries ────────────────────────────────────────────────

    async def get_active_items(self) -> List[Item]:
        """
        Retorna solo items activos.
        """
        ...

    async def get_inactive_items(self) -> List[Item]:
        """
        Retorna items inactivos.
        """
        ...

    async def get_stockable_items(self) -> List[Item]:
        """
        Items que afectan inventario.
        """
        ...
from typing import Protocol, Optional
from src.domain.entities.supply import Supply

class ISupplyRepository(Protocol):
    async def add(self, supply: Supply) -> None:
        """Persiste un nuevo insumo."""
        ...

    async def get_by_item_id(self, item_id: int) -> Optional[Supply]:
        """Obtiene un insumo por su item_id."""
        ...
        
# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE REPOSITORIO DE BOM
# ══════════════════════════════════════════════════════════════════════════════

from typing import Protocol, Optional, List
from src.domain.entities.bom import Bom

class IBomRepository(Protocol):

    async def get_by_id(self, bom_id: int) ->  Optional[Bom]:
        """
        Obtiene una BOM por su ID incluyendo sus líneas.
        Retorna None si no existe.
        """
        ...

    async def get_active_by_item(self, parent_item_id: int) -> Optional[Bom]:
        """
        Obtiene la BOM activa de un item.
        Un item solo puede tener una BOM activa a la vez.
        Retorna None si no existe.
        """
        ...
    
    async def get_all_active(self) -> List[Bom]:
        """
        Obtiene todas las BOMs activas con sus líneas.
        """
        ...

    async def add(self, bom: Bom) -> Bom:
        """
        Persiste una nueva BOM con sus líneas.
        Retorna la entidad con su ID asignado.
        """
        ...
    
    async def update(self, bom: Bom) -> Bom:
        """
        Actualiza una BOM existente en la base de datos.
        Solo persiste cambios en campos que pueden variar después de la creación.
        """
        ...
    
    async def deactivate_current(self, parent_item_id: int) -> None:
        """
        Desactiva la BOM activa actual de un item.
        Se llama antes de activar una nueva versión.
        """
        ...
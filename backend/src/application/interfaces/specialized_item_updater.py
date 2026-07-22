# ══════════════════════════════════════════════════════════════════════════════
# CONTRATO DE ACTUALIZACIÓN DEL REGISTRO DE UN ITEM ESPECIALIZADO
# ══════════════════════════════════════════════════════════════════════════════

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

class SpecializedItemUpdater(ABC):
    """ 
    Contrato para actualizar el registro de un Item especializado.
    """
    
    @abstractmethod
    async def update(
        self, 
        item_id: int, 
        specialized_data: Optional[Dict[str,Any]]
    ) -> Optional[Dict[str, Any]]:
        """ 
        Actualiza el registro especializado asociado al ítem.
        Retorna un dict con los valores ANTIGUOS de los campos modificados,
        o None si no hubo cambios.
 
        Parámetros:
            item_id : ID del ítem base. Usar como FK para ubicar el registro especializado.
            specialized_data : Campos a actualizar. Si es None o vacío, la implementación debe retornar sin hacer nada.
        """
        ...
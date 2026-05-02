# ══════════════════════════════════════════════════════════════════════════════
# CONTRATO PARA LA ESPECIALIZACIÓN DE UN ITEM
# ══════════════════════════════════════════════════════════════════════════════
""" 
Puerto que define el contrato para crear registros especializados asociados a un
Item base. El contrato implica la creación de un Item y su Item Especializado en
una única operación.
"""

from abc import ABC, abstractmethod

class SpecializedItemCreatorPort(ABC):

    @abstractmethod
    async def create(self, item_id: int, command: object) -> None:
        """
        Crea el registro especializado asociado al ítem base.

        Parámetros:
            item_id : ID del ítem base ya persistido (flush, no commit).
            command : El mismo CreateItemCommand del caso de uso.
                      El implementador extrae los campos que necesita
                      de command.specialized_data (dict arbitrario).

        Restricciones:
            - Debe usar la misma AsyncSession que el repositorio de ítems.
            - Debe usar flush() sin commit (el commit lo hace get_db_session).
            - Si falla, debe lanzar SpecializedItemCreationException.
        """
        ...
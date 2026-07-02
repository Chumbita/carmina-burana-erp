# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE REPOSITORIO DE UOM
# ══════════════════════════════════════════════════════════════════════════════

from typing import Protocol, Optional, List
from src.domain.entities.uom import Uom
from src.domain.value_objects.uom_type import UomType

class IUomRepository(Protocol):
    async def get_by_id(self, uom_id: int) -> Optional[Uom]:
        """
        Obtiene una unidad de medida por su ID.
        Retorna None si no existe.
        """
        ...

    async def get_all_by_type(self, uom_type: UomType) -> list[Uom]:
        """
        Para listar todas las UOM de MASS, VOLUME o UNIT
        Útil al mostrar opciones en un formulario de compra
        """
        ...

    async def get_base_by_type(self, uom_type: UomType) -> Optional[Uom]:
        """
        Para obtener la unidad base de un tipo (is_base=True)
        Útil en el cálculo de conversión
        """
        ...

    async def list_options(self) -> List[Uom]:
        """
        Obtiene todas las unidades de medidas para poblar de información
        a elementos del front-end.
        """
        ...

    async def add(self, uom: Uom) -> Uom:
        """
        Persiste una nueva unidad de medida y la retorna con id asignado.
        """
        ...

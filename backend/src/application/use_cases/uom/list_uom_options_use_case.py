# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA OBTENER EL LISTADO DE OPCIONES DE UOM
# ══════════════════════════════════════════════════════════════════════════════

from typing import Sequence

from src.application.dtos.uom.uom_responses_dtos import UomOptionResponseDTO as UomOption
from src.domain.entities.uom import Uom
from src.domain.repositories.uom_repository import IUomRepository


class ListUomOptionsUseCase:

    def __init__(self, uom_repo: IUomRepository):
            self._uom_repo = uom_repo

    async def execute(self) -> Sequence[UomOption]:
        return await self._uom_repo.list_options()

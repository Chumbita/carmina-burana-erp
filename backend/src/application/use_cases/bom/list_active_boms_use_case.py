# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA LISTAR BOMS ACTIVOS
# ══════════════════════════════════════════════════════════════════════════════

from typing import Sequence

from src.application.dtos.bom.bom_responses_dtos import BomListItemResponse
from src.domain.repositories.bom_repository import IBomRepository


class ListActiveBomsUseCase:

    def __init__(self, bom_repository: IBomRepository) -> None:
        self._bom_repository = bom_repository

    async def execute(self) -> Sequence[BomListItemResponse]:
        rows = await self._bom_repository.get_active_boms()
        return [BomListItemResponse.from_dict(row) for row in rows]

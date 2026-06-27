# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA OBTENER UN BOM POR SU ID (DETALLE COMPLETO)
# ══════════════════════════════════════════════════════════════════════════════

from src.application.dtos.bom.bom_responses_dtos import BomDetailResponse
from src.domain.repositories.bom_repository import IBomRepository
from src.domain.exceptions.bom_exceptions import BomNotFoundException


class GetBomByIdUseCase:

    def __init__(self, bom_repository: IBomRepository) -> None:
        self._bom_repository = bom_repository

    async def execute(self, bom_id: int) -> BomDetailResponse:
        data = await self._bom_repository.get_detailed_bom_by_id(bom_id)

        if data is None:
            raise BomNotFoundException(bom_id)

        return BomDetailResponse.from_dict(data)

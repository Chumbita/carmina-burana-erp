# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA OBTENER EL LISTADO DE OPCIONES DE ITEM
# ══════════════════════════════════════════════════════════════════════════════

import logging
from typing import Sequence

from src.application.dtos.items.item_responses_dtos import ItemOptionResponseDTO
from src.domain.repositories.item_repository import IItemRepostory

logger = logging.getLogger(__name__)


class ListItemOptionsUseCase:

    def __init__(self, item_repo: IItemRepostory):
        self._item_repo = item_repo

    async def execute(self) -> Sequence[ItemOptionResponseDTO]:
        result = await self._item_repo.list_options()
        logger.info("ListItemOptionsUseCase: returned %d items", len(result))
        return result

# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA LISTAR BOMS ACTIVOS
# ══════════════════════════════════════════════════════════════════════════════

from src.domain.repositories.bom_repository import IBomRepository
from src.shared.pagination import Page, PaginationParams


class ListActiveBomsUseCase:

    def __init__(self, bom_repository: IBomRepository) -> None:
        self._bom_repository = bom_repository

    async def execute(
        self,
        params: PaginationParams,
        *,
        q: str | None = None,
        sort_by: str = "name",
        sort_order: str = "asc",
    ) -> Page[dict]:
        rows, total = await self._bom_repository.list_active_boms_paginated(
            offset=params.offset,
            limit=params.limit,
            q=q,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return Page(items=rows, total_items=total, params=params)

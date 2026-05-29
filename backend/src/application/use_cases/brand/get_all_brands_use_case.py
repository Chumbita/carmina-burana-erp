# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA OBTENER TODAS LAS MARCAS (BRAND) REGISTRADAS
# ══════════════════════════════════════════════════════════════════════════════

from typing import Sequence

from src.domain.entities.brand import Brand
from src.domain.repositories.brand_repository import IBrandRepository

class GetAllBrandsUseCase:

    def __init__(self, brand_repo: IBrandRepository):
        self._brand_repo = brand_repo

    async def execute(self) -> Sequence[Brand]:
        return await self._brand_repo.get_all()

# ══════════════════════════════════════════════════════════════════════════════
# DEPENDENCIES - CASOS DE USO DE BOM
# ══════════════════════════════════════════════════════════════════════════════

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db

from src.application.use_cases.bom.get_item_bom_use_case import GetItemBomUseCase
from src.infrastructure.database.repositories.bom_repository import BomRepository


def get_item_bom_use_case(
    session: AsyncSession = Depends(get_db),
) -> GetItemBomUseCase:
    """
    Fábrica que instancia GetItemBomUseCase con el repositorio de BOM.
    """
    bom_repository = BomRepository(session)
    return GetItemBomUseCase(bom_repository)
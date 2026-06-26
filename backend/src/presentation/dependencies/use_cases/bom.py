# ══════════════════════════════════════════════════════════════════════════════
# DEPENDENCIES - CASOS DE USO DE BOM
# ══════════════════════════════════════════════════════════════════════════════

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.bom_repository import BomRepository
from src.infrastructure.database.repositories.item_repository import ItemRepository

from src.application.use_cases.bom.create_bom_use_case import CreateBomUseCase


def get_create_bom_use_case(
    session: AsyncSession = Depends(get_db),
) -> CreateBomUseCase:
    """
    Fábrica que instancia CreateBomUseCase con los repositorios de BOM e Item.
    """
    bom_repository = BomRepository(session)
    item_repository = ItemRepository(session)
    return CreateBomUseCase(bom_repository, item_repository)

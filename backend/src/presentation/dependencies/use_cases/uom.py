# ══════════════════════════════════════════════════════════════════════════════
# UOM USE CASE FACTORY
# ══════════════════════════════════════════════════════════════════════════════

from fastapi import Depends

from src.application.use_cases.uom.list_uom_options_use_case import ListUomOptionsUseCase
from src.application.use_cases.uom.create_uom import CreateUomUseCase
from src.presentation.dependencies.repositories import get_uom_respository
from src.domain.repositories.uom_repository import IUomRepository

# ── GET LIST UOM OPTIONS ────────────────────────────────────────────────
#
def get_list_uom_options_use_case(
    repository: IUomRepository = Depends(get_uom_respository)
) -> ListUomOptionsUseCase:
    return ListUomOptionsUseCase(repository)


# ── CREATE UOM ──────────────────────────────────────────────────────────
#
def get_create_uom_use_case(
    repository: IUomRepository = Depends(get_uom_respository)
) -> CreateUomUseCase:
    return CreateUomUseCase(repository)

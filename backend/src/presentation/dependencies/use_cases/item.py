# ══════════════════════════════════════════════════════════════════════════════
# ITEM USE CASE FACTORY
# ══════════════════════════════════════════════════════════════════════════════

from fastapi import Depends

from src.application.use_cases.item.list_item_options_use_case import ListItemOptionsUseCase
from src.presentation.dependencies.repositories import get_item_repository
from src.domain.repositories.item_repository import IItemRepostory


def get_list_item_options_use_case(
    repository: IItemRepostory = Depends(get_item_repository)
) -> ListItemOptionsUseCase:
    return ListItemOptionsUseCase(repository)

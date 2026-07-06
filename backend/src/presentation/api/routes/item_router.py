# ══════════════════════════════════════════════════════════════════════════════
# ROUTER - ITEM
# ══════════════════════════════════════════════════════════════════════════════

import logging
from fastapi import APIRouter, Depends
from typing import List

from src.domain.entities.user import User
from src.presentation.dependencies.auth import get_current_user

from src.presentation.schemas.item_schemas import ItemOptionResponse
from src.application.use_cases.item.list_item_options_use_case import ListItemOptionsUseCase
from src.presentation.dependencies.use_cases.item import get_list_item_options_use_case

logger = logging.getLogger(__name__)

item_router = APIRouter(prefix="/items", tags=["Items"])


@item_router.get("/options", response_model=List[ItemOptionResponse])
async def get_list_item_options(
    use_case: ListItemOptionsUseCase = Depends(get_list_item_options_use_case),
    current_user: User = Depends(get_current_user),
):
    logger.info("GET /items/options called by user=%s", current_user.id)
    result = await use_case.execute()
    logger.info("GET /items/options returning %d items", len(result))
    return result

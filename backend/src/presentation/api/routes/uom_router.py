from fastapi import APIRouter, Depends
from typing import List

# ── Pseudo middleware ────────────────────────────────────────────────
from src.domain.entities.user import User
from src.presentation.dependencies.auth import get_current_user

uom_router = APIRouter(prefix="/uom", tags=["Uom"])

# ── GET UOM OPTIONS ────────────────────────────────────────────────
#
from src.presentation.schemas.uom_schemas import UomOptionResponse
from src.application.use_cases.uom.list_uom_options_use_case import ListUomOptionsUseCase
from src.presentation.dependencies.use_cases.uom import get_list_uom_options_use_case

@uom_router.get("/options", response_model=List[UomOptionResponse])
async def get_list_uom_options(
    use_case: ListUomOptionsUseCase = Depends(get_list_uom_options_use_case),
    current_user: User = Depends(get_current_user),
):
    return await use_case.execute()

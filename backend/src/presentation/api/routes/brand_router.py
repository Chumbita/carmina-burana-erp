from fastapi import APIRouter, Depends

from src.presentation.dependencies.auth import get_current_user

brand_router = APIRouter(prefix="/brands", tags=["Brands"])

# ── GET ALL BRANDS ────────────────────────────────────────────────
from src.application.schemas.brand_schemas import BrandResponse
from src.application.use_cases.brand.get_all_brands_use_case import GetAllBrandsUseCase
from src.presentation.dependencies.use_cases.brand import get_all_brands_use_case

@brand_router.get("/", response_model=List[BrandResponse])
async def get_all_brands(
    use_case: GetAllBrandsUseCase = Depends(get_all_brands_use_case),
    current_user: User = Depends(get_current_user),
):
    return await use_case.execute()

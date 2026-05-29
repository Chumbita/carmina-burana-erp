# ══════════════════════════════════════════════════════════════════════════════
# BRAND USE CASE FACTORY
# ══════════════════════════════════════════════════════════════════════════════

from fastapi import Depends

from src.application.use_cases.brand.get_all_brands_use_case import GetAllBrandsUseCase
from src.presentation.dependencies.repositories import get_brand_respository
from src.domain.repositories.brand_repository import IBrandRepository

# ── GET ALL BRANDS ────────────────────────────────────────────────
def get_all_brands_use_case(
    repository: IBrandRepository = Depends(get_brand_respository)
) -> GetAllBrandsUseCase:
    return GetAllBrandsUseCase(repository)

from fastapi import APIRouter, Depends, HTTPException
from typing import List

from src.domain.entities.user import User
from src.presentation.dependencies.auth import get_current_user

brand_router = APIRouter(prefix="/brands", tags=["Brands"])

# ── GET ALL BRANDS ────────────────────────────────────────────────
from src.presentation.schemas.brand_schemas import BrandResponse
from src.application.use_cases.brand.get_all_brands_use_case import GetAllBrandsUseCase
from src.presentation.dependencies.use_cases.brand import get_all_brands_use_case

@brand_router.get("/", response_model=List[BrandResponse])
async def get_all_brands(
    use_case: GetAllBrandsUseCase = Depends(get_all_brands_use_case),
    current_user: User = Depends(get_current_user),
):
    return await use_case.execute()


# ── DELETE BRAND ────────────────────────────────────────────────
from src.domain.exceptions.brand_exceptions import BrandNotFoundError
from src.application.use_cases.brand.delete_brand import DeleteBrandUseCase
from src.presentation.dependencies.use_cases.brand import get_delete_brand_use_case

@brand_router.delete("/{brand_id}")
async def delete_brand(
    brand_id: int,
    use_case: DeleteBrandUseCase = Depends(get_delete_brand_use_case),
    current_user: User = Depends(get_current_user),
):
    try:
        await use_case.execute(brand_id)
        return {"message": "Marca eliminada correctamente"}
    except BrandNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

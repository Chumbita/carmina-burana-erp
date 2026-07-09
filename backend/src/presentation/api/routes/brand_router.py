from fastapi import APIRouter, Depends
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
    #current_user: User = Depends(get_current_user),
):
    return await use_case.execute()

# ── CREATE BRAND ────────────────────────────────────────────────
from src.presentation.schemas.brand_schemas import CreateBrandRequest
from src.application.use_cases.brand.create_brand import CreateBrandUseCase
from src.application.dtos.brand.brand_commands_dtos import CreateBrandCommand
from src.presentation.dependencies.use_cases.brand import get_create_brand_use_case

@brand_router.post("/", response_model=BrandResponse, status_code=201)
async def create_brand(
    body: CreateBrandRequest,
    use_case: CreateBrandUseCase = Depends(get_create_brand_use_case),
    #current_user: User = Depends(get_current_user),
):
    command = CreateBrandCommand(name=body.name)
    return await use_case.execute(command)

from typing import List

from fastapi import APIRouter, Depends, status

from src.application.dtos.brand.brand_commands_dtos import CreateBrandCommand, UpdateBrandCommand
from src.application.use_cases.brand.create_brand import CreateBrandUseCase
from src.application.use_cases.brand.get_all_brands_use_case import GetAllBrandsUseCase
from src.application.use_cases.brand.manage_brand import (
    DeactivateBrandUseCase,
    GetBrandByIdUseCase,
    UpdateBrandUseCase,
)
from src.presentation.dependencies.use_cases.brand import (
    get_all_brands_use_case,
    get_brand_by_id_use_case,
    get_create_brand_use_case,
    get_deactivate_brand_use_case,
    get_update_brand_use_case,
)
from src.domain.entities.user import User
from src.presentation.dependencies.auth import get_current_user
from src.presentation.schemas.brand_schemas import BrandResponse, CreateBrandRequest, UpdateBrandRequest


brand_router = APIRouter(prefix="/brands", tags=["Brands"])


@brand_router.get("/", response_model=List[BrandResponse])
async def get_all_brands(
    use_case: GetAllBrandsUseCase = Depends(get_all_brands_use_case),
    current_user: User = Depends(get_current_user),
):
    return await use_case.execute()


@brand_router.get("/{brand_id}", response_model=BrandResponse)
async def get_brand_by_id(
    brand_id: int,
    use_case: GetBrandByIdUseCase = Depends(get_brand_by_id_use_case),
    current_user: User = Depends(get_current_user),
):
    return await use_case.execute(brand_id)


@brand_router.post("/", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
async def create_brand(
    body: CreateBrandRequest,
    use_case: CreateBrandUseCase = Depends(get_create_brand_use_case),
    current_user: User = Depends(get_current_user),
):
    command = CreateBrandCommand(name=body.name)
    return await use_case.execute(command)


@brand_router.put("/{brand_id}", response_model=BrandResponse)
async def update_brand(
    brand_id: int,
    body: UpdateBrandRequest,
    use_case: UpdateBrandUseCase = Depends(get_update_brand_use_case),
    current_user: User = Depends(get_current_user),
):
    command = UpdateBrandCommand(brand_id=brand_id, name=body.name)
    return await use_case.execute(command)


@brand_router.delete("/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_brand(
    brand_id: int,
    use_case: DeactivateBrandUseCase = Depends(get_deactivate_brand_use_case),
    current_user: User = Depends(get_current_user),
) -> None:
    await use_case.execute(brand_id)

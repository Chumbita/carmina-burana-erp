# BOM USE CASE FACTORY
from fastapi import Depends
from src.domain.repositories.bom_repository import IBomRepository
from src.presentation.dependencies.repositories import get_bom_repository

# ===========================
# CREATE BOM USE CASE 
# ===========================
from src.presentation.dependencies.repositories import get_product_repository
from src.application.use_cases.bom.create_bom import CreateBomUseCase
from src.domain.repositories.product_repository import IProductRepository

def get_create_bom_use_case(
    product_repository: IProductRepository= Depends(get_product_repository),
    bom_repository: IBomRepository= Depends(get_bom_repository)
) -> CreateBomUseCase:
    return CreateBomUseCase(product_repository, bom_repository)
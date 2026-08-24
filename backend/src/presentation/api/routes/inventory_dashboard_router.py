from fastapi import APIRouter, Depends

from src.application.use_cases.inventory.get_inventory_dashboard import GetInventoryDashboardUseCase
from src.domain.entities.user import User
from src.presentation.dependencies.auth import get_current_user
from src.presentation.dependencies.use_cases.inventory import get_inventory_dashboard_use_case
from src.presentation.schemas.inventory_dashboard_schema import InventoryDashboardResponse


router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get(
    "/dashboard",
    response_model=InventoryDashboardResponse,
    summary="Obtener dashboard de inventario",
)
async def get_inventory_dashboard(
    use_case: GetInventoryDashboardUseCase = Depends(get_inventory_dashboard_use_case),
    current_user: User = Depends(get_current_user),
) -> InventoryDashboardResponse:
    return await use_case.execute()

from typing import Any


class GetInventoryDashboardUseCase:
    def __init__(self, dashboard_repository) -> None:
        self._dashboard_repository = dashboard_repository

    async def execute(self) -> dict[str, Any]:
        return await self._dashboard_repository.get_dashboard()

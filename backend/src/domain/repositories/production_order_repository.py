# ══════════════════════════════════════════════════════════════════════════════
# INTERFAZ DE REPOSITORIO DE PRODUCTION ORDER
# ══════════════════════════════════════════════════════════════════════════════

from typing import Protocol, Optional
from src.domain.entities.production_order import ProductionOrder


class IProductionOrderRepository(Protocol):

    async def get_by_id(self, order_id: int) -> Optional[ProductionOrder]:
        """
        Obtiene una orden de producción por su ID incluyendo
        consumptions y outputs.
        Retorna None si no existe.
        """
        ...

    async def get_all_incomplete(self) -> list[dict]:
        """
        Obtiene todas las órdenes de producción incompletas.
        """
        ...

    async def add(self, order: ProductionOrder) -> ProductionOrder:
        """
        Persiste una nueva orden de producción.
        Retorna la entidad con su ID asignado.
        """
        ...

    async def save(self, order: ProductionOrder) -> ProductionOrder:
        """
        Persiste cambios de estado de una orden existente
        (status, produced_quantity, completed_at).
        """
        ...

    async def add_consumptions(self, order: ProductionOrder) -> None:
        """
        Persiste los registros de consumption de una orden.
        Se llama al pasar a IN_PROGRESS.
        """
        ...

    async def add_outputs(self, order: ProductionOrder) -> None:
        """
        Persiste los registros de output de una orden.
        Se llama al pasar a DONE.
        """
        ...
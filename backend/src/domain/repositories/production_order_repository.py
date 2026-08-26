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

    async def get_detailed_production_order_by_id(self, order_id: int) -> Optional[dict]:
        """
        Obtiene una orden de producción por su ID con toda la información detallada
        (header con nombre del producto, versión del BOM y símbolo de la UM base,
        más sus consumptions y outputs con nombre de item y código de lote).
        Retorna None si no existe.
        """
        ...

    async def get_all_incomplete(self) -> list[dict]:
        """
        Obtiene todas las órdenes de producción incompletas.
        """
        ...

    async def get_all_not_planned(self) -> list[dict]:
        """
        Obtiene todas las órdenes de producción que no están en estado PLANNED
        (historial de cocciones).
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
        Persiste cambios de una orden existente
        (status, cantidades, fechas y descripción).
        """
        ...

    async def add_consumptions(self, order: ProductionOrder) -> None:
        """
        Persiste los registros de consumption de una orden.
        Se llama al ejecutar la orden.
        """
        ...

    async def add_outputs(self, order: ProductionOrder) -> None:
        """
        Persiste los registros de output de una orden.
        Se llama al completar la orden.
        """
        ...

    async def delete(self, order_id: int) -> None:
        """
        Elimina una orden de producción por su ID.
        Utilizado para rollback en caso de error durante la planificación.
        """
        ...
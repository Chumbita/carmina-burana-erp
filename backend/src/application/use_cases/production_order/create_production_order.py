# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO: CREAR ORDEN DE PRODUCCIÓN
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime, timezone
from decimal import Decimal

from src.domain.entities.production_order import ProductionOrder
from src.domain.repositories.production_order_repository import IProductionOrderRepository
from src.domain.repositories.bom_repository import IBomRepository
from src.domain.exceptions.production_exceptions import (
    BomNotFoundException,
    BomNotActiveException,
)


class CreateProductionOrderUseCase:
    """
    Crea una orden de producción en estado PLANNED.

    FLUJO:
        1. Verificar que la BOM existe y está activa.
        2. Construir la entidad ProductionOrder.
        3. Persistir.
        4. Retornar la entidad con su ID asignado.
    """

    def __init__(
        self,
        production_order_repository: IProductionOrderRepository,
        bom_repository: IBomRepository,
    ) -> None:
        self._production_order_repository = production_order_repository
        self._bom_repository = bom_repository

    async def execute(
        self,
        item_id: int,
        bom_id: int,
        planned_quantity: Decimal,
        schedule_date=None,
        description: str = None,
    ) -> ProductionOrder:

        # 1. Verificar BOM
        bom = await self._bom_repository.get_by_id(bom_id)
        if bom is None:
            raise BomNotFoundException(bom_id)
        if not bom.is_active:
            raise BomNotActiveException(bom_id)
        if bom.parent_item_id != item_id:
            raise ValueError("item_id must match BOM parent_item_id")

        # 2. Construir entidad
        order = ProductionOrder(
            item_id=item_id,
            bom_id=bom_id,
            planned_quantity=planned_quantity,
            schedule_date=schedule_date,
            description=description,
            created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )

        # 3. Persistir
        return await self._production_order_repository.add(order)
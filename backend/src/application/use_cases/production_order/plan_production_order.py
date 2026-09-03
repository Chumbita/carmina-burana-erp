# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO FACADE: PLANIFICAR ORDEN DE PRODUCCIÓN
# ══════════════════════════════════════════════════════════════════════════════

from decimal import Decimal

from src.domain.repositories.production_order_repository import IProductionOrderRepository
from src.domain.repositories.bom_repository import IBomRepository
from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.domain.repositories.inventory_lot_repository import IInventoryLotRepository
from src.domain.services.audit_log_service import AuditLogService
from src.domain.services.production_stock_service import ProductionStockService
from src.application.use_cases.production_order.create_production_order import CreateProductionOrderUseCase
from src.domain.exceptions.production_exceptions import BomNotFoundException


class PlanProductionOrderUseCase:
    """
    Facade orquestador: Planificar una orden de producción.

    FLUJO (Todo o Nada):
        1. Obtener la BOM detallada.
        2. Verificar stock suficiente → si falta, lanzar excepción SIN crear la orden.
        3. Crear la orden en estado PLANNED.
        4. Reservar stock lote por lote (FEFO).
        5. Retornar la orden PLANNED con stock reservado.
    """

    def __init__(
        self,
        production_order_repository: IProductionOrderRepository,
        bom_repository: IBomRepository,
        balance_repository: IInventoryBalanceRepository,
        lot_repository: IInventoryLotRepository,
        audit_log_service: AuditLogService | None = None,
    ) -> None:
        self._production_order_repository = production_order_repository
        self._bom_repository = bom_repository
        self._stock_service = ProductionStockService(balance_repository, lot_repository)
        self._audit_log_service = audit_log_service
        self._create_use_case = CreateProductionOrderUseCase(
            production_order_repository, bom_repository
        )

    async def execute(
        self,
        item_id: int,
        bom_id: int,
        planned_quantity: Decimal,
        schedule_date=None,
        description: str = None,
        user_id: int | None = None,
    ):
        # 1. Obtener BOM detallada
        bom = await self._bom_repository.get_detailed_bom_by_id(bom_id)
        if bom is None:
            raise BomNotFoundException(bom_id)

        # 2. Verificar stock (sin crear nada)
        # Usamos un order_id temporal para la excepción; se reemplazará tras crear
        await self._stock_service.verify_stock(
            bom=bom,
            planned_quantity=planned_quantity,
            order_id=0,
        )

        # 3. Crear la orden en estado PLANNED
        order = await self._create_use_case.execute(
            item_id=item_id,
            bom_id=bom_id,
            planned_quantity=planned_quantity,
            schedule_date=schedule_date,
            description=description,
        )

        # 4. Reservar stock (ya verificado)
        try:
            await self._stock_service.reserve_stock(
                bom=bom,
                planned_quantity=planned_quantity,
            )
        except Exception:
            # Rollback: eliminar la orden creada si falla la reserva
            await self._production_order_repository.delete(order.id)
            raise

        # 5. Registrar auditoría
        if self._audit_log_service is not None:
            await self._audit_log_service.log_production_order_create(
                entity_id=order.id,
                new_data={
                    "item_name": bom["parent_item_name"],
                    "bom_version": str(bom["version"]),
                    "planned_quantity": float(order.planned_quantity),
                    "uom_symbol": bom["bom_uom_symbol"],
                    "schedule_date": str(order.schedule_date) if order.schedule_date else None,
                    "description": order.description,
                    "status": order.status.value,
                },
                user_id=user_id,
            )

        return order

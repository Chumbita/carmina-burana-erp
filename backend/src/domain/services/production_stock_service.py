# ══════════════════════════════════════════════════════════════════════════════
# SERVICIO DE DOMINIO: STOCK DE PRODUCCIÓN
# ══════════════════════════════════════════════════════════════════════════════

from decimal import Decimal

from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.domain.repositories.inventory_lot_repository import IInventoryLotRepository
from src.domain.exceptions.production_exceptions import InsufficientStockForProductionException


class ProductionStockService:
    """
    Servicio de dominio que encapsula la lógica de verificación
    y reserva de stock para órdenes de producción.
    """

    def __init__(
        self,
        balance_repository: IInventoryBalanceRepository,
        lot_repository: IInventoryLotRepository,
    ) -> None:
        self._balance_repository = balance_repository
        self._lot_repository = lot_repository

    async def verify_stock(self, bom: dict, planned_quantity: int, order_id: int) -> None:
        """
        Verifica que hay stock suficiente para ejecutar la producción.
        Lanza InsufficientStockForProductionException si falta stock.
        No modifica ningún dato.
        """
        scale = planned_quantity / bom["quantity"]
        missing = []

        for line in bom["lines"]:
            required = line["quantity"] * scale
            available = await self._balance_repository.get_total_available_by_item(
                line["component_item_id"]
            )
            if available < required:
                missing.append({
                    "name": line["component_item_name"],
                    "required": required,
                    "available": available,
                    "uom_symbol": line["uom_symbol"],
                })

        if missing:
            raise InsufficientStockForProductionException(order_id, missing)

    async def reserve_stock(self, bom: dict, planned_quantity: int) -> None:
        """
        Reserva stock lote por lote por FEFO.
        Se asume que verify_stock ya fue llamado con éxito.
        """
        scale = planned_quantity / bom["quantity"]

        for line in bom["lines"]:
            remaining = line["quantity"] * scale
            lots = await self._lot_repository.get_available_by_item_fefo(
                line["component_item_id"]
            )

            for lot in lots:
                if remaining <= Decimal("0"):
                    break

                balance = await self._balance_repository.get_by_lot(
                    line["component_item_id"], lot.id
                )
                if balance is None or balance.is_depleted:
                    continue

                to_reserve = min(balance.available_quantity, remaining)
                balance.reserve(to_reserve)
                await self._balance_repository.save(balance)

                remaining -= to_reserve

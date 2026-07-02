# ══════════════════════════════════════════════════════════════════════════════
# PRODUCTION ORDER ENTITY
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from src.domain.value_objects.production_order_status import ProductionOrderStatus


@dataclass
class ProductionConsumption:
    """
    Detalle de un ítem/lote consumido durante una producción.
    Registra el descuento de inventario al pasar a IN_PROGRESS.
    No tiene vida propia fuera de su ProductionOrder.
    """

    item_id:   int
    lot_id:    int
    quantity:  Decimal
    created_at: datetime

    id: Optional[int] = None
    production_order_id: Optional[int] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if self.item_id is None:
            raise ValueError("item_id is required")
        if self.lot_id is None:
            raise ValueError("lot_id is required")
        if self.quantity is None or self.quantity <= Decimal("0"):
            raise ValueError("quantity must be greater than 0")


@dataclass
class ProductionOutput:
    """
    Detalle del ítem/lote generado como resultado de una producción.
    Registra el alta de inventario al pasar a DONE.
    No tiene vida propia fuera de su ProductionOrder.
    """

    item_id:   int
    lot_id:    int
    quantity:  Decimal
    created_at: datetime

    id: Optional[int] = None
    production_order_id: Optional[int] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if self.item_id is None:
            raise ValueError("item_id is required")
        if self.lot_id is None:
            raise ValueError("lot_id is required")
        if self.quantity is None or self.quantity <= Decimal("0"):
            raise ValueError("quantity must be greater than 0")


@dataclass
class ProductionOrder:
    """
    Cabecera de una orden de producción.
    Representa la ejecución de una BOM para producir un ítem.
    Aplica tanto para brew (cerveza a granel) como para packaging
    (embotellado, enlatado, barril).

    Flujo de estados:
        PLANNED → RELEASED → IN_PROGRESS → DONE
                           ↘ CANCELLED
                ↘ CANCELLED
        Cualquier estado → DISCARDED (producción descartada)
    """

    item_id:          int
    bom_id:           int
    planned_quantity: Decimal
    created_at:       datetime

    id: Optional[int] = None
    produced_quantity: Decimal         = Decimal("0")
    status:            ProductionOrderStatus = ProductionOrderStatus.PLANNED
    schedule_date:     Optional[date]  = None
    completed_at:      Optional[datetime] = None
    description:       Optional[str]   = None

    consumptions: list[ProductionConsumption] = field(default_factory=list)
    outputs:      list[ProductionOutput]      = field(default_factory=list)

    # ── Initialization & Validation ────────────────────────────────

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if self.item_id is None:
            raise ValueError("item_id is required")

        if self.bom_id is None:
            raise ValueError("bom_id is required")

        if self.planned_quantity is None or self.planned_quantity <= Decimal("0"):
            raise ValueError("planned_quantity must be greater than 0")

        if not isinstance(self.status, ProductionOrderStatus):
            raise ValueError(f"Invalid status: {self.status}")

    # ── State Transitions ──────────────────────────────────────────

    def release(self) -> None:
        """
        PLANNED → RELEASED.
        Se llama cuando se verifica que hay stock suficiente.
        """
        if self.status != ProductionOrderStatus.PLANNED:
            raise ValueError(f"Cannot release order in status '{self.status}'")
        self.status = ProductionOrderStatus.RELEASED

    def start(self) -> None:
        """
        RELEASED → IN_PROGRESS.
        Se llama al comenzar la ejecución: se seleccionan lotes (FEFO)
        y se descuenta el inventario de insumos.
        """
        if self.status != ProductionOrderStatus.RELEASED:
            raise ValueError(f"Cannot start order in status '{self.status}'")
        self.status = ProductionOrderStatus.IN_PROGRESS

    def complete(self, produced_quantity: Decimal, completed_at: datetime) -> None:
        """
        IN_PROGRESS → DONE.
        Se llama al cerrar la orden: se crea el lote de output
        y se acredita el inventario del producto terminado.
        """
        if self.status != ProductionOrderStatus.IN_PROGRESS:
            raise ValueError(f"Cannot complete order in status '{self.status}'")

        if produced_quantity is None or produced_quantity <= Decimal("0"):
            raise ValueError("produced_quantity must be greater than 0")

        self.produced_quantity = produced_quantity
        self.completed_at = completed_at
        self.status = ProductionOrderStatus.DONE

    def cancel(self) -> None:
        """
        PLANNED | RELEASED → CANCELLED.
        """
        allowed = {ProductionOrderStatus.PLANNED, ProductionOrderStatus.RELEASED}
        if self.status not in allowed:
            raise ValueError(f"Cannot cancel order in status '{self.status}'")
        self.status = ProductionOrderStatus.CANCELLED

    def discard(self) -> None:
        """
        Cualquier estado → DISCARDED.
        Operación de descarte administrativo.
        """
        if self.status == ProductionOrderStatus.DISCARDED:
            raise ValueError("Order is already discarded")
        self.status = ProductionOrderStatus.DISCARDED
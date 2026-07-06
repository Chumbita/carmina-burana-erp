# ══════════════════════════════════════════════════════════════════════════════
# DTOs - PRODUCTION ORDER
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from typing import Optional


@dataclass
class CreateProductionOrderCommand:
    """Comando para crear una orden de producción."""
    item_id: int
    bom_id: int
    planned_quantity: Decimal
    schedule_date: Optional[date] = None
    description: Optional[str] = None


@dataclass
class ProductionOrderResponse:
    """DTO de respuesta para una orden de producción."""
    id: int
    item_id: int
    bom_id: int
    planned_quantity: Decimal
    produced_quantity: Decimal
    status: str
    schedule_date: Optional[date]
    description: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

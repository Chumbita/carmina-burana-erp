# ══════════════════════════════════════════════════════════════════════════════
# DTOs PARA LOTES
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

from src.domain.value_objects.inventory_transaction_enums import (
    LOT_CREATING_TYPES,
    SIGN_PRESERVED_TYPES,
    SUBTRACTIVE_TYPES,
    TransactionType,
)

class NewLotData(BaseModel):
    """
    Datos requeridos para crear un nuevo lote.
    Solo se incluye en comandos cuyo transaction_type sean de tipo: LOT_CREATING_TYPES.
    """
    lot_code: str
    unit_cost: Decimal = Field(..., gt=0)
    expiration_date: datetime | None = None
    production_date: datetime | None = None
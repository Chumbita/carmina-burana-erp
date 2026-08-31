# ══════════════════════════════════════════════════════════════════════════════
# DTOs PARA AJUSTE MANUAL DE LOTE
# ══════════════════════════════════════════════════════════════════════════════

from decimal import Decimal
from pydantic import BaseModel, Field


class AdjustLotCommand(BaseModel):
    """
    Comando para ajustar manualmente la cantidad de un lote.

    El ajuste se expresa como `new_quantity` (cantidad física real
    contada). El caso de uso calcula el delta y registra la
    transacción correspondiente.
    """

    item_id: int = Field(..., gt=0)
    lot_id: int = Field(..., gt=0)
    new_quantity: Decimal = Field(..., ge=0, decimal_places=4, max_digits=14)
    reason: str = Field(..., min_length=3, max_length=500)
    user_id: int | None = Field(None, ge=1)

    @property
    def trimmed_reason(self) -> str:
        return self.reason.strip()


class AdjustLotResult(BaseModel):
    """Resultado del ajuste: cantidades y delta."""

    item_id: int
    lot_id: int
    previous_quantity: Decimal
    new_quantity: Decimal
    delta: Decimal
    reserved_quantity: Decimal

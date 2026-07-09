from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

from src.domain.value_objects.inventory_transaction_enums import TransactionType

TRANSACTION_LABELS: dict[str, str] = {
    TransactionType.PURCHASE.value: "Compra",
    TransactionType.RETURN_PURCHASE.value: "Devolución a proveedor",
    TransactionType.PRODUCTION_CONSUMITION.value: "Consumo en producción",
    TransactionType.PRODUCTION_OUTPUT.value: "Producción",
    TransactionType.PRODUCTION_DISCARD.value: "Desecho de producción",
    TransactionType.SALE.value: "Venta",
    TransactionType.RETURN_SALE.value: "Devolución de venta",
    TransactionType.INVENTORY_COUNT_ADJUSTMENT.value: "Ajuste de inventario",
    TransactionType.LOSS.value: "Pérdida",
}


class TransactionResponseSchema(BaseModel):
    id: int
    lot_id: int
    lot_code: str
    quantity: Decimal
    transaction_type: str
    transaction_label: str
    reference_type: str
    reference_id: int
    created_at: datetime

    class Config:
        from_attributes = True
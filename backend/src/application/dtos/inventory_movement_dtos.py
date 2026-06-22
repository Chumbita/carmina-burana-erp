# ══════════════════════════════════════════════════════════════════════════════
# DTOs PARA EL SERVICIO DE MOVIMIENTO DE INVENTARIO
# ══════════════════════════════════════════════════════════════════════════════

from decimal import Decimal
from pydantic import BaseModel, Field, model_validator

from src.domain.value_objects.inventory_transaction_enums import (
    LOT_CREATING_TYPES,
    SUBTRACTIVE_TYPES,
    TransactionType,
)
from src.application.dtos.inventory_lot_dtos import NewLotData

class InventoryMovementCommand(BaseModel):
    """
    DTO de entrada al caso de uso de movimiento de inventario.

    Su función es validar y estructurar el input externo antes de
    pasarlo al dominio. Es el contrato entre la presentación y la
    lógica de negocio.

    Cualquier módulo del sistema (Compras, Ventas, Producción) que
    necesite mover inventario construye este comando y lo entrega al
    InventoryApplicationService. Nunca acceden a los repositorios
    de inventario directamente.
    """
    item_id: int = Field(..., gt=0)
    transaction_type: TransactionType
    quantity: Decimal = Field(..., decimal_places=4)
    reference_type: str
    reference_id: int = Field(..., gt=0)
    lot_id: int | None = Field(None, gt=0)
    new_lot_data: NewLotData | None = None

    @model_validator(mode="after")
    def validate_lot_consistency(self) -> "InventoryMovementCommand":
        """
        Valida la coherencia entre transaction_type y los campos de lote.
        """
        is_lot_creating = self.transaction_type in LOT_CREATING_TYPES

        if is_lot_creating:
            if not self.new_lot_data:
                raise ValueError(
                    f"'{self.transaction_type}' require 'new_lot_data'."
                )
            if self.lot_id is not None:
                raise ValueError(
                    f"'{self.transaction_type}' creates a new lot; 'lot_id' must be None."
                )
        else:
            if self.lot_id is None:
                raise ValueError(
                    f"'{self.transaction_type}' require 'lot_id' de un lote existente."
                )
            if self.new_lot_data is not None:
                raise ValueError(
                    f"'{self.transaction_type}' operates on an existing lot; "
                    "'new_lot_data' must be None."
                )

        if (
            self.transaction_type in SUBTRACTIVE_TYPES
            and self.quantity <= Decimal("0")
        ):
            raise ValueError("For outgoing transactions, 'quantity' must be positive. The system applies the discount internally.")

        return self
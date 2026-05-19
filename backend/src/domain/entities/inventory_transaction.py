# ══════════════════════════════════════════════════════════════════════════════
# INVENTORY TRANSACTION
# ══════════════════════════════════════════════════════════════════════════════
""" 
Una transacción es un HECHO del inventario y los hechos no se
modifican; se corrigen con nuevos hechos (transacciones inversas).

En este sentido, una transacción es INMUTABLE por definición de 
negocio. Una vez registrado un movimiento, nunca cambia. Dado que
es inmutable, no tiene operaciones de mutación. Su comportamiento
se limita a consultas sobre sus propios datos y a la validación 
de que nació con un estado coherente.
"""

from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

@dataclass(frozen=True)
class InventoryTransaction:
    """
    Una transacción de inventario representa una entidad inmutable.
    En este sentido, la entidad no tiene operaciones de mutación, solo
    consultas sobre sus propios datos y validación de nacimiento.
    """
    
    item_id: int
    lot_id: int
    quantity: Decimal
    transaction_type: str
    reference_type: str
    reference_id: int
    created_at: datetime
    id: Optional[int] = None

    # Método que se ejecuta automáticamente luego de una instanciación.
    def __post_init__(self) -> None:
        self._validate()
    
    
    # --- Validaciones --------------------------------------------------
    def _validate(self) -> None:
        if self.quantity == Decimal("0"):
            raise ValueError("A transaction cannot have a zero quantity. It does not represent any inventory movement.")

        if not self.reference_type or not self.reference_type.strip():
            raise ValueError("The reference type cannot be empty.")

        if self.reference_id <= 0:
            raise ValueError(
                f"The reference ID must be valid. Received: {self.reference_id}"
            )

    
    # --- Registro de transacción ----------------------------------------

    @classmethod
    def record(
        cls,
        item_id: int,
        lot_id: int,
        signed_quantity: Decimal,
        transaction_type: str,
        reference_type: str,
        reference_id: int,
    ) -> "InventoryTransaction":
        """
        Crea un registro de transacción nuevo aún no persistido.
        """
        return cls(
            item_id=item_id,
            lot_id=lot_id,
            quantity=signed_quantity,
            transaction_type=transaction_type,
            reference_type=reference_type,
            reference_id=reference_id,
            created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )

    # --- Utilidades --------------------------------------------------

    @property
    def is_inbound(self) -> bool:
        """The transaction represents a stock entry."""
        return self.quantity > Decimal("0")

    @property
    def is_outbound(self) -> bool:
        """The transaction represents a stock outflow."""
        return self.quantity < Decimal("0")

    @property
    def absolute_quantity(self) -> Decimal:
        """Magnitude of the movement without sign, useful for reports."""
        return abs(self.quantity)
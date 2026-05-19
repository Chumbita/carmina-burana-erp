# ══════════════════════════════════════════════════════════════════════════════
# INVENTORY BALANCE
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional

@dataclass
class InventoryBalance:
    """
    Entidad que representa el balance actual de un lote en el inventario.

    REGLAS DE NEGOCIO:
    - La cantidad reservada nunca puede superar la cantidad total.
    - La cantidad nunca puede quedar negativa como resultado de una
      operación de salida normal (la entidad rechaza el movimiento).
    - La cantidad reservada nunca puede ser negativa.

    COMPORTAMIENTO CENTRAL:
    La entidad sabe aplicar movimientos sobre sí misma y validar que
    el resultado sea coherente.
    """
    
    item_id: int
    lot_id: int
    quantity: Decimal
    reserved_quantity: Decimal
    updated_at: datetime
    id: Optional[int] = None


    # Método que se ejecuta automáticamente luego de una instanciación.
    def __post_init__(self) -> None:
        self._validate()
    
    # --- Validaciones --------------------------------------------------
    
    def _validate(self):
        if self.quantity < Decimal("0"):
            raise ValueError(f"The initial amount cannot be negative. Received: {self.quantity}")

        if self.reserved_quantity < Decimal("0"):
            raise ValueError(f"The amount reserved cannot be negative. Received: {self.reserved_quantity}")

        if self.reserved_quantity > self.quantity:
            raise ValueError(f"The amount reserved ({self.reserved_quantity}) cannot exceed the total amount ({self.quantity})")

    
    # --- Método de fábrica ----------------------------------------------

    @classmethod
    def initialize(cls, item_id: int, lot_id: int, initial_quantity: Decimal) -> "InventoryBalance":
        """
        Crea el balance inicial de un lote recién ingresado al sistema.
        Esto significa que la cantidad reservada ("reserved_quantity")
        parte en cero.
        
        El método retorna una instancia de la clase con los atributos proporcionados en el método.
        """
        if initial_quantity <= Decimal("0"):
            raise ValueError(f"The initial amount of a new balance must be positive. Received: {initial_quantity}")
        
        return cls(
            item_id=item_id,
            lot_id=lot_id,
            quantity=initial_quantity,
            reserved_quantity=Decimal("0"),
            updated_at=datetime.now(timezone.utc),
        )

    # --- Utilidades --------------------------------------------------

    @property
    def available_quantity(self) -> Decimal:
        """
        Cantidad disponible (availability = total - reserved).
        Es la cantidad que el módulo de ventas o producción puede 
        comprementer sin riesgo de sobreasignación.
        """
        return self.quantity - self.reserved_quantity

    @property
    def is_depleted(self) -> bool:
        """El lote no tiene stock disponible."""
        return self.available_quantity <= Decimal("0")
    

    # --- Comportamientos --------------------------------------------------

    # Operaciones de movimiento:
    
    def apply_delta(self, delta: Decimal) -> None:
        """
        Aplica un incremento (delta > 0) o decremento (delta < 0) al balance.
        """

        from src.domain.exceptions.inventory_exceptions import InsufficientStockError

        projected = self.quantity + delta

        if projected < Decimal("0"):
            raise InsufficientStockError(
                item_id=self.item_id,
                lot_id=self.lot_id,
                available=float(self.quantity),
                requested=float(abs(delta)),
            )

        self.quantity = projected
        self.updated_at = datetime.now(timezone.utc)

    def force_apply_delta(self, delta: Decimal) -> None:
        """
        Aplica el delta sin validar stock suficiente.
        SOLO para ajustes de inventario (INVENTORY_COUNT_ADJUSTMENT)
        donde el resultado puede ser negativo intencionalmente
        (el conteo real reveló que había menos stock del registrado).
        """
        
        self.quantity += delta
        self.updated_at = datetime.now(timezone.utc)

    
    # Operaciones de reserva:

    def reserve(self, amount: Decimal) -> None:
        """
        Reserva una cantidad para un compromiso futuro (ej: orden de venta
        confirmada pero no despachada).
        """
        
        if amount <= Decimal("0"):
            raise ValueError(f"The amount to be reserved must be positive. Received: {amount}")

        if amount > self.available_quantity:
            raise ValueError(
                f"There is not enough stock available to reserve  {amount}. "
                f"Available: {self.available_quantity} "
                f"(total: {self.quantity}, already reserved: {self.reserved_quantity})."
            )

        self.reserved_quantity += amount
        self.updated_at = datetime.now(timezone.utc)

    def release_reservation(self, amount: Decimal) -> None:
        """
        Libera una reserva previamente creada.
        Ocurre cuando una orden es cancelada o cuando el despacho
        efectivo se registra (la reserva se convierte en una salida real).
        """
        if amount <= Decimal("0"):
            raise ValueError(f"The amount to be released must be positive. Received: {amount}")

        if amount > self.reserved_quantity:
            raise ValueError(
                f"Cannot release {amount}: only {self.reserved_quantity} is reserved."
            )

        self.reserved_quantity -= amount
        self.updated_at = datetime.now(timezone.utc)
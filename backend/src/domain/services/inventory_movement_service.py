# ══════════════════════════════════════════════════════════════════════════════
# REGLAS DE NEGOCIO PARA EL MOVIMIENTO DE INVENTARIO
# ══════════════════════════════════════════════════════════════════════════════

from decimal import Decimal

from src.domain.value_objects.inventory_transaction_enums import (
    ADDITIVE_TYPES,
    LOT_CREATING_TYPES,
    SIGN_PRESERVED_TYPES,
    SUBTRACTIVE_TYPES,
    TransactionType,
)
from src.domain.exceptions.inventory_exceptions import InsufficientStockError


class InventoryDomainService:
    """
    Servicio de dominio que contiene la lógica de negocio para las operaciones de inventario.
    """

    def compute_signed_quantity(self, transaction_type: TransactionType, quantity: Decimal) -> Decimal:
        """
        Transforma la magnitud del movimiento a su valor con signo final.

        REGLAS DE NEGOCIO:
        - ADDITIVE_TYPES → siempre positivo.
        - SUBTRACTIVE_TYPES → siempre negativo.
        - SIGN_PRESERVED → el signo será el proporcionado. Utilizado en operaciones de ajuste manual de inventario.
        """
        if transaction_type in ADDITIVE_TYPES:
            return abs(quantity)

        if transaction_type in SUBTRACTIVE_TYPES:
            return -abs(quantity)

        if transaction_type in SIGN_PRESERVED_TYPES:
            return quantity

    def requires_new_lot(self, transaction_type: TransactionType) -> bool:
        """
        Determina si el tipo de transacción implica la creación de un lote nuevo.
        """
        return transaction_type in LOT_CREATING_TYPES
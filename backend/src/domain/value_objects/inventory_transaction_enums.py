from enum import Enum

class TransactionType(str, Enum):
    """
    Representa todos los tipos de movimiento posible en el inventario.
    """
    PURCHASE = "PURCHASE"
    RETURN_PURCHASE = "RETURN_PURCHASE"
    PRODUCTION_CONSUMITION = "PRODUCTION_CONSUMITION"
    PRODUCTION_OUTPUT = "PRODUCTION_OUTPUT"
    PRODUCTION_DISCARD = "PRODUCTION_DISCARD"
    SALE = "SALE"
    RETURN_SALE = "RETURN_SALE"
    INVENTORY_COUNT_ADJUSTMENT = "INVENTORY_COUNT_ADJUSTMENT"
    LOSS = "LOSS"


# --- Clasificadores de comportamiento ----------------------------------------
# Estas constantes son el corazón de la lógica del motor. En lugar de usar
# if/elif por tipo de transacción en el servicio, el tipo en sí mismo declara
# su comportamiento. Agregar un nuevo tipo solo requiere agregarlo aquí.
# -----------------------------------------------------------------------------

# --- Tipos de transacciones que suman ----------------------------------------
"""
Tipos que SUMAN cantidad al balance existente.
- PURCHASE: llega mercadería nueva.
- PRODUCTION_OUTPUT: se produce un ítem terminado que entra al stock.
- RETURN_SALE: el cliente devuelve mercadería que vuelve al stock.
"""

ADDITIVE_TYPES: frozenset[TransactionType] = frozenset({
    TransactionType.PURCHASE,
    TransactionType.PRODUCTION_OUTPUT,
    TransactionType.RETURN_SALE,
})


# --- Tipos de transacciones que restan ---------------------------------------
"""
Tipos que RESTAN cantidad al balance existente.
- RETURN_PURCHASE: devolvemos mercadería al proveedor → sale del inventario.
- PRODUCTION_CONSUMITION: consumimos materia prima en producción.
- PRODUCTION_DISCARD: descartamos producción defectuosa.
- SALE: vendemos → sale del inventario.
- LOSS: pérdida, robo, vencimiento, etc.
"""

SUBTRACTIVE_TYPES: frozenset[TransactionType] = frozenset({
    TransactionType.RETURN_PURCHASE,
    TransactionType.PRODUCTION_CONSUMITION,
    TransactionType.PRODUCTION_DISCARD,
    TransactionType.SALE,
    TransactionType.LOSS,
})


# --- Tipos de transacciones que crean lotes ---------------------------------
"""
Tipos que necesariamente crean un nuevo registro en `inventory_lot`.
Toda compra y toda producción introducen un lote nuevo al sistema.
Los demás tipos operan sobre lotes ya existentes.
"""

LOT_CREATING_TYPES: frozenset[TransactionType] = frozenset({
    TransactionType.PURCHASE,
    TransactionType.PRODUCTION_OUTPUT,
})


# --- Transacción especial ---------------------------------------------------
""" 
Tipos cuya `quantity` puede ser positiva O negativa según el contexto.
En un ajuste de inventario, si el conteo real > stock registrado → positivo.
Si el conteo real < stock registrado → negativo.
"""

SIGN_PRESERVED_TYPES: frozenset[TransactionType] = frozenset({
    TransactionType.INVENTORY_COUNT_ADJUSTMENT,
})

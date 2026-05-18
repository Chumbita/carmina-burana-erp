# ══════════════════════════════════════════════════════════════════════════════
# EXCEPCIONES DE INVENTARIO
# ══════════════════════════════════════════════════════════════════════════════

class InventoryDomainError(Exception):
    """
    Clase base de todos los errores de dominio del inventario.
    Permite que la capa de presentación capture errores de negocio
    de forma genérica sin conocer los tipos concretos.
    """


class InsufficientStockError(InventoryDomainError):
    """
    Excepción que se lanza cuando un movimiento de salida supera el stock disponible.
    El stock (atributo "quantity") nunca puede quedar negativo (salvo ajuste 
    manual del inventario).

    """
    def __init__(self, item_id: int, lot_id: int, available: float, requested: float) -> None:
        self.item_id = item_id
        self.lot_id = lot_id
        self.available = available
        self.requested = requested
        super().__init__(
            f"Insufficient stock for item_id={item_id}, lot_id={lot_id}. "
            f"Available: {available}, requested: {requested}."
        )


class LotNotFoundError(InventoryDomainError):
    """
    Escepción que se lanza cuando se referencia a un lot_id que no existe en el sistema.
    El dominio define que operar sobre un lote inexistente es inválido.
    """
    def __init__(self, lot_id: int) -> None:
        self.lot_id = lot_id
        super().__init__(f"The lot with ID={lot_id} does not exist.")


class DuplicateLotCodeError(InventoryDomainError):
    """
    Se lanza cuando se intenta crear un lote con un código ya registrado
    para el mismo ítem. El unique constraint en DB es el respaldo técnico,
    pero el dominio también debe expresar esta regla explícitamente.
    """
    def __init__(self, item_id: int, lot_code: str) -> None:
        self.item_id = item_id
        self.lot_code = lot_code
        super().__init__(
            f"There is already a batch with code '{lot_code}' for item_id={item_id}."
        )
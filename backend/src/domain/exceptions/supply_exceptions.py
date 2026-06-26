# ══════════════════════════════════════════════════════════════════════════════
# EXCEPCIONES DE DOMINIO DE INSUMOS
# ══════════════════════════════════════════════════════════════════════════════

from src.domain.exceptions.item_exceptions import DomainException

class SupplyNotFoundException(DomainException):
    """ 
    Excepción lanzada cuando un 'supply' no fue encontrado mediante su ID.
    """
    def __init__(self, item_id: int) -> None:
        super().__init__(f"Supply with item_id={item_id} was not found.")
        self.item_id = item_id

class SupplyAlreadyExistsException(DomainException):
    """ 
    Excepción lanzada cuando se intenta crear un 'supply' que ya existe.
    """
    def __init__(self, item_id: int) -> None:
        super().__init__(f"Supply with item_id={item_id} already exists.")
        self.item_id = item_id


class SupplyHasStockException(DomainException):
    """
    Excepción lanzada cuando se intenta eliminar un supply que tiene stock disponible.
    """
    def __init__(self, item_id: int) -> None:
        super().__init__(
            f"Supply with item_id={item_id} cannot be deleted: it has active stock."
        )
        self.item_id = item_id
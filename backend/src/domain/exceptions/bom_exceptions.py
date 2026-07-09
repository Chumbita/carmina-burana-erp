# ══════════════════════════════════════════════════════════════════════════════
# EXCEPCIONES DE DOMINIO PARA BOM
# ══════════════════════════════════════════════════════════════════════════════

from src.domain.exceptions.item_exceptions import DomainException


class BomNotFoundException(DomainException):
    """
    Excepción lanzada cuando un BOM no fue encontrado mediante su ID.
    """
    def __init__(self, bom_id: int) -> None:
        super().__init__(f"BOM with id={bom_id} was not found.")
        self.bom_id = bom_id


class BomCreationException(DomainException):
    """
    Excepción lanzada cuando falla la creación de un BOM.
    """
    def __init__(self, reason: str) -> None:
        super().__init__(f"Failed to create BOM: {reason}")


class BomAlreadyActiveException(DomainException):
    """
    Excepción lanzada cuando se intenta activar un BOM ya activo.
    """
    def __init__(self, bom_id: int) -> None:
        super().__init__(f"BOM with id={bom_id} is already active.")
        self.bom_id = bom_id

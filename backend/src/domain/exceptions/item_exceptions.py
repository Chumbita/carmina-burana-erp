"""
Excepciones de dominio para el módulo Item.
Cada excepción es semánticamente específica para facilitar su mapeo
a códigos HTTP en la capa de presentación.
"""


class DomainException(Exception):
    """Clase base. Todas las excepciones de dominio heredan de aquí."""


class ItemNotFoundException(DomainException):
    def __init__(self, item_id: int) -> None:
        super().__init__(f"Item with id={item_id} was not found.")
        self.item_id = item_id


class ItemAlreadyDeletedException(DomainException):
    def __init__(self, item_id: int) -> None:
        super().__init__(
            f"Item with id={item_id} is permanently deleted and cannot be modified."
        )
        self.item_id = item_id


class ItemInvalidStatusTransitionException(DomainException):
    def __init__(self, item_id: int, from_status: str, to_status: str) -> None:
        super().__init__(
            f"Invalid status transition for item id={item_id}: "
            f"{from_status} → {to_status}."
        )
        self.item_id = item_id
        self.from_status = from_status
        self.to_status = to_status


class SpecializedItemCreationException(DomainException):
    """
    Lanzada cuando falla la creación del registro especializado
    asociado al ítem base. El ítem base NO se persiste en este caso
    porque ambas operaciones ocurren en la misma transacción.
    """
    def __init__(self, reason: str) -> None:
        super().__init__(
            f"Failed to create specialized item record: {reason}"
        )

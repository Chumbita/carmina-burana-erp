# ══════════════════════════════════════════════════════════════════════════════
# EXCEPCIONES DE DOMINIO PARA ITEM
# ══════════════════════════════════════════════════════════════════════════════

class DomainException(Exception):
    """Clase base. Todas las excepciones de dominio heredan de aquí."""


class ItemNotFoundException(DomainException):
    """ 
    Excepción lanzada cuando un Item no fue encontrado mediante su ID.
    """
    def __init__(self, item_id: int) -> None:
        super().__init__(f"Item with id={item_id} was not found.")
        self.item_id = item_id


class ItemAlreadyDeletedException(DomainException):
    """ 
    Excepción lanzada cuando se intenta aplicar una operación 'delete'
    o 'soft_delete' a un item ya eliminado.
    """
    def __init__(self, item_id: int) -> None:
        super().__init__(
            f"Item with id={item_id} is permanently deleted and cannot be modified."
        )
        self.item_id = item_id


class ItemInvalidStatusTransitionException(DomainException):
    """ 
    Excepción lanzada cuando se intenta realizar un cambio de transición no 
    permitida entre estados.
    """
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

class SpecializedItemUpdateException(DomainException):
    """
    Lanzada cuando falla la actualización del registro especializado
    asociado al ítem base.
    """
    def __init__(self, reason: str) -> None:
        super().__init__(
            f"Failed to update specialized item record: {reason}"
        )
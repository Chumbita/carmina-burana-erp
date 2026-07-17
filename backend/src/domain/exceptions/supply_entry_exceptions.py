from datetime import datetime


class SupplyEntryNotFound(Exception):
    """La recepción no existe en el sistema."""
    def __init__(self, entry_id: int) -> None:
        super().__init__(f"Supply entry with id {entry_id} not found")


class SupplyEntryCannotBeCancelled(Exception):
    """La recepción no puede ser anulada por su estado actual."""
    def __init__(self, entry_id: int, reason: str = "entry cannot be cancelled") -> None:
        super().__init__(f"Supply entry {entry_id}: {reason}")


class SupplyEntryAlreadyCancelled(Exception):
    """La recepción ya fue anulada previamente."""
    def __init__(self, entry_id: int) -> None:
        super().__init__(f"Supply entry {entry_id} is already cancelled")


class SupplyEntryItemsConsumed(Exception):
    """No se puede anular porque los lotes generados ya tienen consumos."""
    def __init__(self, entry_id: int, lot_codes: list[str]) -> None:
        codes = ", ".join(lot_codes)
        super().__init__(
            f"Cannot cancel entry {entry_id}: lots ({codes}) have been consumed"
        )


class InvalidSupplyEntryData(Exception):
    """Datos inválidos proporcionados para la operación."""
    def __init__(self, detail: str) -> None:
        super().__init__(detail)


class SupplyEntryTimeWindowExceeded(Exception):
    """La recepción supera las 48hs y ya no puede ser anulada."""
    def __init__(self, entry_id: int, entry_date: datetime) -> None:
        super().__init__(
            f"Supply entry {entry_id} dated {entry_date.date()} is older than 48h and cannot be cancelled"
        )


class SupplyEntryLotAdjusted(Exception):
    """No se puede anular porque los lotes generados tienen ajustes de inventario."""
    def __init__(self, entry_id: int, lot_codes: list[str]) -> None:
        codes = ", ".join(lot_codes)
        super().__init__(
            f"Cannot cancel entry {entry_id}: lots ({codes}) have inventory adjustments"
        )

from datetime import datetime, timedelta
from typing import Optional

from src.domain.entities.input_entry import InputEntry
from src.domain.repositories.input_entry_repository import InputEntryRepositoryInterface
from src.domain.exceptions.input_entry_exceptions import (
    SupplyEntryNotFound,
    SupplyEntryCannotBeCancelled,
    SupplyEntryAlreadyCancelled,
    SupplyEntryItemsConsumed
)

class CancelInputEntryDTO:
    def __init__(self, reason: str):
        self.reason = reason

class CancelInputEntry:
    def __init__(self, input_entry_repository: InputEntryRepositoryInterface):
        self.input_entry_repository = input_entry_repository

    async def execute(self, entry_id: int, dto: CancelInputEntryDTO) -> InputEntry:
        # Get entry
        entry = await self.input_entry_repository.find_by_id(entry_id)
        if not entry:
            raise SupplyEntryNotFound(f"No se encontró el abastecimiento con ID {entry_id}")

        # Check if already cancelled
        if hasattr(entry, 'status') and entry.status == 'cancelled':
            raise SupplyEntryAlreadyCancelled("El abastecimiento ya está anulado")

        # Check time limit (48 hours)
        created_at = entry.created_at or datetime.now()
        time_limit = timedelta(hours=48)
        time_diff = datetime.now() - created_at
        
        if time_diff > time_limit:
            raise SupplyEntryCannotBeCancelled("No se puede anular: pasaron más de 48 horas")

        # Check for consumed batches
        for item in entry.items or []:
            if item.batch and item.batch.current_amount < item.batch.initial_amount:
                raise SupplyEntryItemsConsumed("No se puede anular: hay lotes consumidos")

        # Cancel entry (update status)
        entry.status = 'cancelled'
        entry.annulled_at = datetime.now()
        entry.annulment_reason = dto.reason

        # Save changes
        await self.input_entry_repository.update(entry)

        return entry

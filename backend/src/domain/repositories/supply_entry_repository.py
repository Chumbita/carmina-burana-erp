from typing import Protocol

from src.domain.entities.supply_entry import SupplyEntryOrder, SupplyEntryLine


class ISupplyEntryRepository(Protocol):

    async def add_order(self, order: SupplyEntryOrder) -> SupplyEntryOrder:
        ...

    async def add_line(self, line: SupplyEntryLine, supply_entry_id: int) -> None:
        ...

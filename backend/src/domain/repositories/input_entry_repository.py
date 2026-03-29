from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from src.domain.entities.input_entry import InputEntry

class InputEntryRepositoryInterface(ABC):

    @abstractmethod
    async def save(self, entry: InputEntry) -> InputEntry:
        pass

    @abstractmethod
    async def find_by_id(self, entry_id: int) -> Optional[InputEntry]:
        pass

    @abstractmethod
    async def find_all(self, filters: Optional[Dict[str, Any]] = None) -> List[InputEntry]:
        pass

    @abstractmethod
    async def update(self, entry: InputEntry) -> InputEntry:
        pass

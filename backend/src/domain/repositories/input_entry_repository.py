from abc import ABC, abstractmethod
from src.domain.entities.input_entry import InputEntry

class InputEntryRepositoryInterface(ABC):

    @abstractmethod
    async def save(self, entry: InputEntry) -> InputEntry: 
        ...

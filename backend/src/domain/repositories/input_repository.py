from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.entities.input import Input

class InputRepository(ABC):


    @abstractmethod
    async def get_all(self) -> List[Input]:
        pass

    @abstractmethod
    async def get_by_id(self, input_id: int) -> Optional[Input]:
        pass

    @abstractmethod
    async def create(self, input: Input) -> Input:
        pass

    @abstractmethod
    async def update(self, input_id: int, input: Input) -> Optional[Input]:
        pass

    @abstractmethod
    async def delete(self, input_id: int) -> bool:
        pass

    @abstractmethod
    async def exists_by_name(self, name: str) -> bool:
        pass

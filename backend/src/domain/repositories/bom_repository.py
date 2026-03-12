from typing import Protocol, Optional, List
from src.domain.entities.bom import Bom, BomItem

class IBomRepository(Protocol):
    async def create(self, bom: Bom) -> Bom:
        ...
    
    async def update(self, bom: Bom) -> Bom:
        ...
    
    async def delete(self, id: int) -> bool:
        ...
    
    async def find_active_bom(self) -> List[Bom]:
        ...
    
    async def find_all_bom(self) -> List[Bom]:
        ...
    
    async def find_by_id(self, id: int) ->  Optional[Bom]:
        ...
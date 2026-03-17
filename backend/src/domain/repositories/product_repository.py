from typing import Protocol, Optional, List
from src.domain.entities.product import Product

class IProductRepository(Protocol):
    async def save(self, product: Product) -> Product:
        ...
        
    async def create(self, product: Product) -> Product:
        ...
        
    async def update(self, product: Product) -> Product:
        ...
    
    async def delete(self, id: int) -> bool:
        ...
    
    async def find_actives(self) -> List[Product]:
        ...
        
    async def find_all(self) -> List[Product]:
        ...
    
    async def find_by_id(self, id: int) -> Optional[Product]:
        ...
    
    async def find_by_name(self, name: str) -> Optional[Product]:
        ...
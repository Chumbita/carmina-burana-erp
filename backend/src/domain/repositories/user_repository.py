from typing import Protocol, Optional
from src.domain.entities.user import User

class IUserRepository(Protocol):
    async def save(self, user: User) -> User:
        ...
        
    async def find_by_username(self, username: str) -> Optional[User]:
        """ 
        Busca a un usuario por su username.
        """
        
    async def find_by_id(self, user_id: int) -> Optional[User]:
        """ 
        Busca a un usuario por su id.
        """
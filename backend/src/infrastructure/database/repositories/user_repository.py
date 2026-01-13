from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.domain.entities.user import User
from src.infrastructure.database.models import UserModel

class UserRepository:
    def __init__(self, session: AsyncSession):
        self._session = session
        
    @staticmethod
    def _to_model(user: User) -> UserModel:
        return UserModel(
            id=user.id,
            username=user.username,
            full_name=user.full_name,
            password=user.hashed_password,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at
        )
        
    @staticmethod
    def _to_entity(model: UserModel) -> User:
        return User(
            id=model.id,
            username=model.username,
            full_name=model.full_name,
            hashed_password=model.password,
            role=model.role,
            is_active=model.is_active,
            created_at=model.created_at
        )
    
    async def save(self, user: User) -> User:
        user_model = self._to_model(user)
        self._session.add(user_model)
        await self._session.commit()
        await self._session.refresh(user_model)
        return self._to_entity(user_model)
    
    async def update(self, user: User) -> User:
        stmt = select(UserModel).where(UserModel.id == user.id)
        result = await self._session.execute(stmt)
        user_model = result.scalar_one_or_none()
        
        user_model.username = user.username
        user_model.full_name = user.full_name
        user_model.password = user.hashed_password
        user_model.role = user.role
        user_model.is_active = user.is_active
        user_model.created_at = user.created_at
        
        await self._session.commit()
        await self._session.refresh(user_model)
        return self._to_entity(user_model)
    
    async def find_by_username(self, username: str) -> Optional[User]:
        stmt = select(UserModel).where(UserModel.username == username)
        result = await self._session.execute(stmt)
        user_model = result.scalar_one_or_none()
        
        if user_model is None:
            return None
        
        return self._to_entity(user_model)
    
    async def find_by_id(self, user_id: int) -> Optional[User]:
        stmt = select(UserModel).where(UserModel.id == user_id)
        result = await self._session.execute(stmt)
        user_model = result.scalar_one_or_none()
        
        if user_model is None:
            return None
        
        return self._to_entity(user_model)
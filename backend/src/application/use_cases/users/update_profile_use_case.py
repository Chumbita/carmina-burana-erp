from src.domain.entities.user import User
from src.domain.repositories.user_repository import IUserRepository


class UpdateProfileUseCase:
    def __init__(self, user_repository: IUserRepository):
        self._user_repository = user_repository

    async def execute(self, user_id: int, email: str) -> User:
        user = await self._user_repository.find_by_id(user_id)
        if not user:
            raise ValueError("El usuario no existe.")

        user.change_email(email)
        return await self._user_repository.update(user)

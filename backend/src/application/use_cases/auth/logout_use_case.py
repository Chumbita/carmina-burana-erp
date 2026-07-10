from src.domain.repositories.refresh_token_repository import IRefreshTokenRepository


class LogoutUseCase:
    """
    Caso de uso para cerrar sesión de un usuario.
    """

    def __init__(self, refresh_token_repository: IRefreshTokenRepository):
        self._refresh_token_repository = refresh_token_repository

    async def execute(self, user_id: int) -> None:
        """
        Ejecuta el logout revocando todos los refresh tokens del usuario.
        """
        await self._refresh_token_repository.revoke_all_user_tokens(user_id)

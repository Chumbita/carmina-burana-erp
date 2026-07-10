from typing import Protocol, Optional
from datetime import datetime


class IRefreshTokenRepository(Protocol):
    """
    Protocolo para persistencia de refresh tokens.
    """

    async def save(self, token: str, user_id: int, username: str, expires_at: datetime) -> None:
        """
        Guarda un refresh token en la base de datos.
        """

    async def find_by_token(self, token: str) -> Optional[dict]:
        """
        Busca un refresh token por su valor.
        """

    async def revoke(self, token: str) -> None:
        """
        Revoca un refresh token (lo marca como inválido).
        """

    async def revoke_all_user_tokens(self, user_id: int) -> None:
        """
        Revoca todos los refresh tokens de un usuario.
        """

    async def delete_expired_tokens(self) -> int:
        """
        Elimina todos los refresh tokens expirados.
        """

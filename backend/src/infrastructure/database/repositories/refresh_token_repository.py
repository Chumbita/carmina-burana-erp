from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.models.refresh_token_model import RefreshTokenModel


class RefreshTokenRepository:
    """
    Implementación del repositorio de refresh tokens.
    """

    def __init__(self, session: AsyncSession):
        self._session = session

    async def save(self, token: str, user_id: int, username: str, expires_at: datetime) -> None:
        """
        Guarda un refresh token en la base de datos.
        """
        refresh_token_model = RefreshTokenModel(
            token=token,
            user_id=user_id,
            username=username,
            expires_at=expires_at,
            revoked=False
        )
        self._session.add(refresh_token_model)
        await self._session.flush()

    async def find_by_token(self, token: str) -> Optional[dict]:
        """
        Busca un refresh token por su valor.
        """
        query = select(RefreshTokenModel).where(RefreshTokenModel.token == token)
        result = await self._session.execute(query)
        model = result.scalar_one_or_none()

        if model is None:
            return None

        return {
            "id": model.id,
            "token": model.token,
            "user_id": model.user_id,
            "username": model.username,
            "expires_at": model.expires_at,
            "revoked": model.revoked,
            "created_at": model.created_at
        }

    async def revoke(self, token: str) -> None:
        """
        Revoca un refresh token.
        """
        query = (
            update(RefreshTokenModel)
            .where(RefreshTokenModel.token == token)
            .values(revoked=True, revoked_at=datetime.now(timezone.utc))
        )
        await self._session.execute(query)
        await self._session.flush()

    async def revoke_all_user_tokens(self, user_id: int) -> None:
        """
        Revoca todos los refresh tokens de un usuario.
        """
        query = (
            update(RefreshTokenModel)
            .where(
                RefreshTokenModel.user_id == user_id,
                RefreshTokenModel.revoked == False
            )
            .values(revoked=True, revoked_at=datetime.now(timezone.utc))
        )
        await self._session.execute(query)
        await self._session.flush()

    async def delete_expired_tokens(self) -> int:
        """
        Elimina todos los refresh tokens expirados.
        """
        query = delete(RefreshTokenModel).where(
            RefreshTokenModel.expires_at < datetime.now(timezone.utc)
        )
        result = await self._session.execute(query)
        await self._session.flush()
        rowcount: int = result.rowcount or 0
        return rowcount

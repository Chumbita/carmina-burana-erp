from datetime import datetime, timedelta, timezone

from src.domain.repositories.refresh_token_repository import IRefreshTokenRepository
from src.domain.repositories.user_repository import IUserRepository
from src.domain.services.token_service import ITokenService
from src.infrastructure.config.settings import settings


class RefreshTokenUseCase:
    """
    Caso de uso para renovar tokens de acceso.

    Implementa Refresh Token Rotation:
    1. Valida el refresh token proporcionado.
    2. Revoca el refresh token anterior.
    3. Genera un nuevo access token.
    4. Genera un nuevo refresh token.
    5. Almacena el nuevo refresh token.

    Esto asegura que cada refresh token solo se pueda usar una vez,
    proporcionando seguridad adicional contra tokens robados.
    """

    def __init__(
        self,
        refresh_token_repository: IRefreshTokenRepository,
        user_repository: IUserRepository,
        token_service: ITokenService
    ):
        self._refresh_token_repository = refresh_token_repository
        self._user_repository = user_repository
        self._token_service = token_service

    async def execute(self, refresh_token: str) -> dict:
        """
        Ejecuta la renovación de tokens.
        """

        # 1) Buscar el refresh token en la DB
        token_data = await self._refresh_token_repository.find_by_token(refresh_token)

        if not token_data:
            raise ValueError("Refresh token inválido.")

        # 2) Verificar que no esté revocado
        if token_data["revoked"]:
            raise ValueError("Refresh token revocado.")

        # 3) Verificar que no esté expirado
        if token_data["expires_at"] < datetime.now(timezone.utc):
            raise ValueError("Refresh token expirado.")

        # 4) Buscar el usuario para verificar que existe y está activo
        user = await self._user_repository.find_by_id(token_data["user_id"])

        if not user:
            raise ValueError("Usuario no encontrado.")

        if not user.is_active:
            raise ValueError("Usuario inactivo.")

        # 5) Revocar el refresh token anterior
        await self._refresh_token_repository.revoke(refresh_token)

        # 6) Generar nuevos tokens
        new_access_token = self._token_service.create_access_token(user.id, user.username)
        new_refresh_token = self._token_service.create_refresh_token(user.id, user.username)

        # 7) Calcular expiración del nuevo refresh token
        new_expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.JWT_REFRESH_TOKEN_EXPIRATION_MINUTES
        )

        # 8) Almacenar el nuevo refresh token
        await self._refresh_token_repository.save(
            token=new_refresh_token,
            user_id=user.id,
            username=user.username,
            expires_at=new_expires_at
        )

        # 9) Retornar nuevos tokens y datos del usuario
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "role": user.role
            }
        }

from datetime import datetime, timedelta, timezone

from src.domain.entities.user import User
from src.domain.repositories.user_repository import IUserRepository
from src.domain.repositories.refresh_token_repository import IRefreshTokenRepository
from src.domain.services.password_service import IPasswordService
from src.domain.services.token_service import ITokenService
from src.infrastructure.config.settings import settings


class LoginUseCase:
    """
    Caso de uso para autenticar un usuario.

    Flujo:
    1. Buscar usuario por username.
    2. Verificar que el usuario existe.
    3. Validar password.
    4. Generar access token.
    5. Generar refresh token.
    6. Almacenar refresh token en DB.
    7. Devolver ambos tokens.
    """

    def __init__(
        self,
        user_repository: IUserRepository,
        password_service: IPasswordService,
        token_service: ITokenService,
        refresh_token_repository: IRefreshTokenRepository
    ):
        self._user_repository = user_repository
        self._password_service = password_service
        self._token_service = token_service
        self._refresh_token_repository = refresh_token_repository

    async def execute(self, username: str, password: str) -> dict:
        """
        Ejecuta flujo de login de un usuario.
        """

        # 1) Buscar usuario por username
        user = await self._user_repository.find_by_username(username)

        # 2) Verificar que el usuario existe
        if not user:
            raise ValueError("Credenciales inválidas.")

        # 3) Validar password
        is_valid = self._password_service.verify_password(password, user.hashed_password)

        if not is_valid:
            raise ValueError("Credenciales inválidas.")

        # 4) Generar access token
        access_token = self._token_service.create_access_token(user.id, user.username)

        # 5) Generar refresh token
        refresh_token = self._token_service.create_refresh_token(user.id, user.username)

        # 6) Calcular expiración del refresh token
        refresh_token_expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.JWT_REFRESH_TOKEN_EXPIRATION_MINUTES
        )

        # 7) Almacenar refresh token en DB
        await self._refresh_token_repository.save(
            token=refresh_token,
            user_id=user.id,
            username=user.username,
            expires_at=refresh_token_expires_at
        )

        # 8) Devolver tokens y datos de usuario
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "role": user.role
            }
        }

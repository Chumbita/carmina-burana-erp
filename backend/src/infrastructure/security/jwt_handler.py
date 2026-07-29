from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from jose import jwt, JWTError, ExpiredSignatureError
from src.infrastructure.config.settings import settings


class JWTHandler:
    """
    Manejador de tokens JWT.

    Implementa la generación y validación de:
    - Access Tokens:  para requests autenticados
    - Refresh Tokens:  para renovar access tokens

    El tipo de token se identifica mediante el claim "type" en el payload.
    """

    # Tipos de token soportados
    ACCESS_TOKEN_TYPE = "access"
    REFRESH_TOKEN_TYPE = "refresh"

    def create_access_token(self, user_id: int, username: str) -> str:
        """
        Crea un access token JWT.
        """
        return self._create_token(
            user_id=user_id,
            username=username,
            token_type=self.ACCESS_TOKEN_TYPE,
            expiration_minutes=settings.JWT_ACCESS_TOKEN_EXPIRATION_MINUTES
        )

    def create_refresh_token(self, user_id: int, username: str) -> str:
        """
        Crea un refresh token JWT.
        """
        return self._create_token(
            user_id=user_id,
            username=username,
            token_type=self.REFRESH_TOKEN_TYPE,
            expiration_minutes=settings.JWT_REFRESH_TOKEN_EXPIRATION_MINUTES
        )

    def decode_token(self, token: str) -> dict:
        """
        Decodifica y verifica un token JWT.
        """
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            return payload
        except ExpiredSignatureError:
            raise ValueError("Token expirado.")
        except JWTError as e:
            raise ValueError(f"Token inválido: {str(e)}")

    def decode_token_unverified(self, token: str) -> dict:
        """
        Decodifica un token JWT SIN verificar la firma.

        Para extraer información del token antes de validar
        (por ejemplo, para determinar el tipo de token).
        """
        try:
            payload = jwt.get_unverified_claims(token)
            return payload
        except JWTError:
            return {}

    def _create_token(
        self,
        user_id: int,
        username: str,
        token_type: str,
        expiration_minutes: int
    ) -> str:
        """
        Método interno para crear tokens JWT.
        """
        now = datetime.now(timezone.utc)
        expire = now + timedelta(minutes=expiration_minutes)

        payload = {
            "sub": str(user_id),
            "username": username,
            "type": token_type,
            "exp": expire,
            "iat": now,
            "jti": f"{user_id}_{int(now.timestamp())}_{token_type}"
        }

        token = jwt.encode(
            payload,
            settings.SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )

        return token

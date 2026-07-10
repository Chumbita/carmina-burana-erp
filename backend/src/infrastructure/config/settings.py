from pydantic_settings import BaseSettings
from typing import List
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../../.env"))


class Settings(BaseSettings):
    """
    Configuración general de la aplicación.

    Lee las variables de entorno automáticamente.
    """
    DATABASE_URL: str
    SECRET_KEY: str
    ALLOWED_ORIGINS: str

    # Configuración de JWT
    JWT_ALGORITHM: str = "HS256"

    # Access Token
    JWT_ACCESS_TOKEN_EXPIRATION_MINUTES: int = 15

    # Refresh Token
    JWT_REFRESH_TOKEN_EXPIRATION_MINUTES: int = 60 * 24 * 7

    # Cookie settings
    COOKIE_DOMAIN: str = "localhost"
    COOKIE_SECURE: bool = False  # True en producción (requiere HTTPS)
    COOKIE_SAMESITE: str = "lax"  # lax para desarrollo, strict en producción

    @property
    def allowed_origins_list(self) -> List[str]:
        """Convierte el string de orígenes permitidos a una lista"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    @property
    def cookie_max_age_access_token(self) -> int:
        """Max age para la cookie del access token en segundos"""
        return self.JWT_ACCESS_TOKEN_EXPIRATION_MINUTES * 60

    @property
    def cookie_max_age_refresh_token(self) -> int:
        """Max age para la cookie del refresh token en segundos"""
        return self.JWT_REFRESH_TOKEN_EXPIRATION_MINUTES * 60


# Instancia global de Settings
settings = Settings()

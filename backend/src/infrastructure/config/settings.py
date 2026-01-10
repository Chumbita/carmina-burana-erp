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
    JWT_EXPIRATION_MINUTES: int = 60 * 24 # -> 24 horas
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Convierte el string de orígenes permitidos a una lista"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
        
# Instancia global de Settings
settings = Settings()
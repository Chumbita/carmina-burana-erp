from typing import Protocol, Dict

class ITokenService(Protocol):
    """
    Interfaz para operaciones con tokens JWT.
    """

    def create_access_token(self, user_id: int, username: str) -> str:
        """
        Crea un access token JWT.
        """

    def create_refresh_token(self, user_id: int, username: str) -> str:
        """
        Crea un refresh token JWT.
        """

    def decode_token(self, token: str) -> dict:
        """
        Decodifica y verifica un token JWT.
        """

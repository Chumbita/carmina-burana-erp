from typing import Protocol

class ITokenService(Protocol):
    """ 
    Interfaz para operaciones con tokens JWT
    """
    
    def create_access_token(self, user_id: int, username: str) -> str:
        """ 
        Crea un token JWT para un usuario.
        """
    
    def decode_token(self, token: str) -> dict:
        """ 
        Decodifica y verifica un toke JWT
        """
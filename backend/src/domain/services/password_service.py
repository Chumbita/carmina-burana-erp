from typing import Protocol

class IPasswordService(Protocol):
    """ 
    Interfaz para las operaciones con password.
    """
    def hash_password(self, plain_password: str) -> str:
        """ 
        Hashea una password en texto plano.
        """
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """ 
        Verifica si una password coincide con su hash. 
        """
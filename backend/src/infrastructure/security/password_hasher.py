from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class PasswordHasher:
    """
    Implementación del servicio de passwords usando argon2-cffi.
    """
    
    def hash_password(self, plain_password: str) -> str:
        """ 
        Hashea una password en texto plano.
        """
        
        return pwd_context.hash(plain_password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """ 
        Verifica si una password coincide con su hash.
        """
        
        return pwd_context.verify(plain_password, hashed_password)
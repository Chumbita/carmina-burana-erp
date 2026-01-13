from datetime import datetime, timedelta
from jose import jwt, JWTError
from src.infrastructure.config.settings import settings

class JWTHandler: 
    """ 
    
    """
    def create_access_token(self, user_id: int, username: str) -> str:
        """ 
        Crea un token JWT para el usuario
        """
        
        # Calcular tiempo de expiración 
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
        
        # Payload del token
        payload = {
            "sub": user_id,
            "username": username,
            "exp": expire
        }
        
        # Crear token firmado
        token = jwt.encode(payload, settings.SECRET_KEY, settings.JWT_ALGORITHM)
        
        return token
    
    def decode_token(self, token: str) -> dict:
        """ 
        Decodifica y verifica el token JWT.
        """
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            return payload
        except JWTError as e:
            raise ValueError(f"Token inválido: {str(e)}")
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.security.jwt_handler import JWTHandler
from src.infrastructure.database.deps import get_db 
from src.infrastructure.database.repositories.user_repository import UserRepository
from src.domain.entities.user import User

# HTTPBearer extrae el token del header Authorization
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User: 
    """ 
    Dependencia que verifica el toke y devuelve el usuario actual.
    
    Flujo: 
    1. Extraer el token desde el header Authorization: Bearer <token>.
    2. Decodoficar y verificar el token.
    3. Obtener el user_id del token.
    4. Buscar el usuario en la db.
    5. Verificar que existe y está activo.
    6. Devolver usuario.
    """
    
    # 1. Obtener el token 
    token = credentials.credentials
    
    # 2. Decodificar el token
    jwt_handler = JWTHandler()
    try: 
        payload = jwt_handler.decode_token(token)
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido."
            )
    except ValueError: 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado."
        )
        
    # 3. Buscar el usuario en la DB
    repository = UserRepository(db)
    user = await repository.find_by_id(user_id)
    
    # 4. Verificar que el usuario existe
    if user is None:
        raise HTTPException(
            status=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado."
        )
    
    # 5. Verificar que el usuario está activo
    if not user.is_active:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo."
        )
    
    return user
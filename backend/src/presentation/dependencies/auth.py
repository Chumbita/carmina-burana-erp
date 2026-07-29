from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.security.jwt_handler import JWTHandler
from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.user_repository import UserRepository
from src.domain.entities.user import User


# HTTPBearer para compatibilidad con el header Authorization
security = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependencia que verifica la autenticación y devuelve el usuario actual.

    Soporta múltiples métodos de autenticación (en orden de prioridad):
    1. Cookie HttpOnly "access_token" (método recomendado)
    2. Header Authorization: Bearer <token> (para compatibilidad)

    Flujo:
    1. Extraer el token de la cookie o header
    2. Decodificar y verificar el token
    3. Verificar que es un access token (no un refresh token)
    4. Obtener el user_id del token
    5. Buscar el usuario en la DB
    6. Verificar que existe y está activo
    7. Devolver usuario
    """

    token = None

    # 1) Intentar obtener el token de la cookie
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        token = cookie_token

    # 2) Si no hay cookie, intentar del header Authorization
    if not token and credentials:
        token = credentials.credentials

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado. Proporcione un token de acceso válido.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 3) Decodificar el token
    jwt_handler = JWTHandler()
    try:
        payload = jwt_handler.decode_token(token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 4) Verificar que es un access token
    token_type = payload.get("type")
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de tipo inválido. Se requiere un access token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 5) Obtener el user_id del token
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: falta el identificador de usuario.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: identificador de usuario mal formado.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 6) Buscar el usuario en la DB
    repository = UserRepository(db)
    user = await repository.find_by_id(user_id)

    # 7) Verificar que el usuario existe
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 8) Verificar que el usuario está activo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo."
        )

    return user

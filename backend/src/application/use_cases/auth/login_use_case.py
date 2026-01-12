from src.domain.entities.user import User
from src.domain.repositories.user_repository import IUserRepository
from src.domain.services.password_service import IPasswordService
from src.domain.services.token_service import ITokenService

class LoginUseCase:
    """ 
    Caso de uso para autenticar un usuario.
    
    Flujo:
    1. Buscar usuario por username.
    2. Verificar que el usuario existe.
    3. Validar password. 
    4. Generar token JWT.
    5. Devolver token JWT.
    """
    
    def __init__(
        self,
        user_repository: IUserRepository,
        password_service: IPasswordService,
        token_service: ITokenService
        ):
        self._user_repository = user_repository
        self._password_service = password_service
        self._token_service = token_service
    
    async def execute(self, username: str, password: str) -> dict:
        """ 
        Ejecuta flujo de login de un usuario.
        """
        
        # 1) Buscar usuario por username
        user = await self._user_repository.find_by_username(username)
        
        # 2) Verificar que el usuario existe
        if not user:
            raise ValueError("Credenciales inválidas.")
        
        # 3) Validar password
        is_valid = self._password_service.verify_password(password, user.hashed_password)
        
        if not is_valid:
            raise ValueError("Credenciales inválidas.")
        
        # 4) Generar access token
        access_token = self._token_service.create_access_token(user.id, user.username)
        
        # 5) Devolver access token y datos de usuario.
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "role": user.role
            }
        }
        
        
        
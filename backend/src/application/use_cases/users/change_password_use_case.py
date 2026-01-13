from src.domain.entities.user import User
from src.domain.repositories.user_repository import IUserRepository
from src.domain.services.password_service import IPasswordService

class ChangePasswordUseCase:
    """ 
    Caso de uso para cambiar contraseña de usuario.
    
    Flujo:
    1. Buscar usuario por ID.
    2. Verificar que el usuario existe.
    3. Validar contraseña actual.
    4. Validar que el usuario está activo. 
    5. Validar  nueva contraseña. 
    6. Hashear la nueva contraseña. 
    7. Aplicar cambios. 
    """
    def __init__(
        self,
        user_repository: IUserRepository,
        password_service: IPasswordService
        ):
        self._user_repository = user_repository
        self._password_service = password_service
        
    async def execute(self, user_id: str, current_password: str, new_password: str) -> User:
        """ 
        Ejecuta el flujo de cambio de contraseña.
        """
        
        # 1) Buscar usuario por ID.
        user = await self._user_repository.find_by_id(user_id)
        
        # 2) Verificar que el usuario existe.
        if not user:
            raise ValueError("El usuario no existe.")
        
        # 3) Validar contraseña actual.
        is_valid = self._password_service.verify_password(current_password, user.hashed_password)
        
        if not is_valid:
            raise ValueError("La contraseña actual es incorrecta.")
        
        # 4) Validar que el usuario está activo. 
        if not user.is_active:
            raise ValueError("Usuario inactivo: no puede realizar esta acción.")
        
        # 5) Valida nueva contraseña
        
        # Validar que no sea un caracter vacío
        if not new_password or new_password.strip() == "": 
            raise ValueError("La nueva contraseña no puede estar vacía ni contener solo espacios.")
        
        # (+) Agregar validaciones complejas como por ejemplo mínimo de caracteres, al menos una mayúscula, un número, etc
        
        # Validar que la nueva contraseña es diferente a la actual. 
        is_same = self._password_service.verify_password(new_password, user.hashed_password)
        
        if is_same:
            raise ValueError("La nueva contraseña no puede ser igual a la anterior.")
        
        # 6) Hashear la nueva contraseña. 
        new_hashed_password = self._password_service.hash_password(new_password)
        
        # 7) Aplicar cambios.
        user.change_password(new_hashed_password)
        updated_user = await self._user_repository.update(user)
        
        return updated_user

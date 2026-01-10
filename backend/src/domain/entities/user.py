from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class User:
    id: int = field(default=None)
    username: str = field(default="")
    full_name: str = field(default="")
    hashed_password: str = field(default="")
    role: str = field(default="")
    is_active: bool = field(default=True)
    created_at: datetime = field(default_factory=datetime.now)
    
    @classmethod
    def create(cls, username, full_name, hashed_password, role) -> "User" :
        """
        Crea un usuario validando las reglas de negocio.
        """
        
        if len(username) < 3:
            raise ValueError("El nombre de usuario debe tener al menos 3 caracteres.")
        if len(full_name) == 0:
            raise ValueError("El nombre completo no puede ser un campo vacío.")
        if not hashed_password:
            raise ValueError("El password hasheado es requerido.")
        if role != "admin" or role != "host":
            raise ValueError("Rol de usuario inválido.")
        
        return cls(
            username = username,
            full_name = full_name,
            hashed_password = hashed_password,
            role = role
        )
# SERVICE FACTORY

# ========================
# PASSWORD HASHER SERVICE
# ========================
from src.domain.services.password_service import IPasswordService
from src.infrastructure.security.password_hasher import Argon2PasswordHasher

def get_password_hasher_service() -> IPasswordService:
    return Argon2PasswordHasher()


# ========================
# JWT SERVICE
# ========================
from src.domain.services.token_service import ITokenService
from src.infrastructure.security.jwt_handler import JWTHandler

def get_token_handler_service() -> ITokenService:
    return JWTHandler()
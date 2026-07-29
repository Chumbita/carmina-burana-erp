from pydantic import BaseModel


class LoginRequest(BaseModel):
    """
    Schema para login.
    """
    username: str
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "username": "tuusuario",
                "password": "tucontraseña"
            }
        }


class LoginResponse(BaseModel):
    """
    Schema de respuesta para login.

    Los tokens NO se incluyen en el body - se envían como cookies HttpOnly.
    Solo se retorna la información del usuario.
    """
    user: dict

    class Config:
        json_schema_extra = {
            "example": {
                "user": {
                    "id": 1,
                    "username": "birrabirra",
                    "full_name": "Pity Alvarez",
                    "role": "admin"
                }
            }
        }


class RefreshTokenResponse(BaseModel):
    """
    Schema de respuesta para refresh token.

    Los tokens NO se incluyen en el body - se envían como cookies HttpOnly.
    Solo se retorna la información del usuario.
    """
    user: dict

    class Config:
        json_schema_extra = {
            "example": {
                "user": {
                    "id": 1,
                    "username": "birrabirra",
                    "full_name": "Pity Alvarez",
                    "role": "admin"
                }
            }
        }


class LogoutResponse(BaseModel):
    """
    Schema de respuesta para logout.
    """
    message: str = "Sesión cerrada exitosamente."

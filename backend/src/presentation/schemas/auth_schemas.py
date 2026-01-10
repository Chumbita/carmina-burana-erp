from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    """ 
    Schema para login.
    """
    username: str
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "lamalditabirra",
                "password": "contraseñasegura123"
            }
        }
    
class TokenResponse(BaseModel):
    """ 
    Schema de respuesta con el token
    """
    access_token: str
    token_type: str
    user: dict
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "username": "lamalditabirra",
                    "full_name": "Pity Alvarez",
                    "role": "admin"
                }
            }
        }
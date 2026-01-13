from pydantic import BaseModel

class ChangePasswordRequest(BaseModel):
    """ 
    Schema para cambiar contraseña.
    """
    current_password: str
    new_password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "current_password": "contraseñaactualsegura123",
                "new_password": "nuevacontraseñasegura123"
            }
        }
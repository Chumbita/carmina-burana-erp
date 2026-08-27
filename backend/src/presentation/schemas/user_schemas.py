from pydantic import BaseModel, field_validator

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


class UpdateProfileRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = value.strip().lower()
        if not email or "@" not in email or "." not in email.rsplit("@", 1)[-1]:
            raise ValueError("El correo electrónico no es válido.")
        return email

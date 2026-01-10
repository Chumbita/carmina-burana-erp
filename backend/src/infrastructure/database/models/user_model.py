from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from src.infrastructure.database.base import Base

class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum("admin", "host", name="user_roles"), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
from sqlalchemy import Boolean, Column, Integer, String, TIMESTAMP
from src.infrastructure.database.base import Base

class BrandModel(Base):
    __tablename__ = "brand"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)
    updated_at = Column(TIMESTAMP, nullable=True)
    deleted_at = Column(TIMESTAMP, nullable=True)

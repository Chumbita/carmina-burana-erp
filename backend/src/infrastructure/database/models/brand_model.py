from sqlalchemy import Column, Integer, String, TIMESTAMP
from src.infrastructure.database.base import Base

class BrandModel(Base):
    __tablename__ = "brand"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(TIMESTAMP, nullable=False)
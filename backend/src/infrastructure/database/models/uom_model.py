from sqlalchemy import Column, Integer, String
from src.infrastructure.database.base import Base

class UomModel(Base):
    __tablename__ = "uom"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, unique=True)
    abbreviation = Column(String(10), nullable=False, unique=True)
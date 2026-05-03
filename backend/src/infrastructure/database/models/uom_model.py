from sqlalchemy import Column, Integer, String, Boolean, Numeric
from src.infrastructure.database.base import Base

class UomModel(Base):
    __tablename__ = "uom"

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String(50), nullable=False, unique=True)
    symbol = Column(String(10), nullable=False)
    uom_type = Column(String(20), nullable=False)
    factor_to_base = Column(Numeric(24, 10), nullable=True)
    is_base = Column(Boolean, nullable=False, default=False)
    
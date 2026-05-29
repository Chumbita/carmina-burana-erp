from sqlalchemy import Column, Integer, String, TIMESTAMP
from src.infrastructure.database.base import Base


class SupplierModel(Base):
    __tablename__ = "supplier"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    status = Column(String(20), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)
    updated_at = Column(TIMESTAMP, nullable=False)

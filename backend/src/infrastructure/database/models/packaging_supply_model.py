from sqlalchemy import Column, BigInteger, String, Numeric, TIMESTAMP, ForeignKey
from src.infrastructure.database.base import Base

class PackagingSupplyModel(Base):
    __tablename__ = "packaging_supply"

    item_id = Column(BigInteger, ForeignKey("item.id"), primary_key=True, nullable=False)
    packaging_type = Column(String(255), nullable=False)
    material = Column(String(255), nullable=False)
    capacity_ml = Column(Numeric(14, 4), nullable=True)
    created_at = Column(TIMESTAMP, nullable=False)
    updated_at = Column(TIMESTAMP, nullable=True)
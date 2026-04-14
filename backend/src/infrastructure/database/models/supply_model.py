from sqlalchemy import Column, BigInteger, String, TIMESTAMP, ForeignKey
from src.infrastructure.database.base import Base

class SupplyModel(Base):
    __tablename__ = "supply"

    item_id = Column(BigInteger, ForeignKey("item.id"), primary_key=True, nullable=False)
    supply_category = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)
    updated_at = Column(TIMESTAMP, nullable=True)
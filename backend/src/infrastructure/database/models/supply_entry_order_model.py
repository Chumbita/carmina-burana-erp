from sqlalchemy import Column, BigInteger, Integer, String, Text, TIMESTAMP, ForeignKey
from src.infrastructure.database.base import Base


class SupplyEntryOrderModel(Base):
    __tablename__ = "supply_entry_order"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    supplier_id = Column(Integer, ForeignKey("supplier.id"), nullable=True)
    document_number = Column(String(50), nullable=False)
    entry_date = Column(TIMESTAMP, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)

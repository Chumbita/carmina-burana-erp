from sqlalchemy import Column, BigInteger, Numeric, String, Text, TIMESTAMP, ForeignKey
from src.infrastructure.database.base import Base


class SupplyEntryLineModel(Base):
    __tablename__ = "supply_entry_line"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    supply_entry_id = Column(BigInteger, ForeignKey("supply_entry_order.id"), nullable=False)
    item_id = Column(BigInteger, ForeignKey("item.id"), nullable=False)
    quantity = Column(Numeric(14, 4), nullable=False)
    unit_cost = Column(Numeric(18, 6), nullable=False)
    expiration_date = Column(TIMESTAMP, nullable=False)
    lot_code = Column(String(50), nullable=True)
    comment = Column(Text, nullable=True)

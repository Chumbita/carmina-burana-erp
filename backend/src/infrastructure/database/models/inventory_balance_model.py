from sqlalchemy import Column, BigInteger, Numeric, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship

from src.infrastructure.database.base import Base

class InventoryBalance(Base):
    __tablename__ = "inventory_balance"

    item_id = Column(BigInteger, nullable=False, unique=True)
    lot_id = Column(BigInteger, ForeignKey("inventory_lot.id"), nullable=False, primary_key=True)
    quantity = Column(Numeric(14, 4), nullable=False)
    reserved_quantity = Column(Numeric(14, 4), nullable=False, default=("0"))
    updated_at = Column(TIMESTAMP, nullable=False)

    lot = relationship(back_populates="balance")
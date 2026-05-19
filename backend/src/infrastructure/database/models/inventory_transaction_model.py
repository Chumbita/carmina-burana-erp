from sqlalchemy import Column, BigInteger, String, Numeric, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship

from src.infrastructure.database.base import Base


class InventoryTransactionModel(Base):
    __tablename__ = "inventory_transaction"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    item_id = Column(BigInteger, nullable=False)
    lot_id = Column(BigInteger, ForeignKey("inventory_lot.id"), nullable=False)
    quantity = Column(Numeric(14, 4), nullable=False)
    transaction_type = Column(String, nullable=False)
    reference_type = Column(String, nullable=False)
    reference_id = Column(BigInteger, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)

    lot = relationship("InventoryLotModel", back_populates="transactions")

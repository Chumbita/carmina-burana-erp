from sqlalchemy import BigInteger, Column, ForeignKey, Index, Numeric, TIMESTAMP

from src.infrastructure.database.base import Base


class InventoryBalanceModel(Base):
    __tablename__ = "inventory_balance"

    item_id = Column(BigInteger, ForeignKey("item.id"), primary_key=True, nullable=False)
    lot_id = Column(BigInteger, ForeignKey("inventory_lot.id"), nullable=True)
    quantity = Column(Numeric(14, 4), nullable=False)
    reserved_quantity = Column(Numeric(14, 4), nullable=False)
    updated_at = Column(TIMESTAMP, nullable=False)

    __table_args__ = (Index("ix_inventory_balance_item_lot", "item_id", "lot_id"),)

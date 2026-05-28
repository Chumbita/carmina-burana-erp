from sqlalchemy import BigInteger, Column, ForeignKey, Numeric, String, TIMESTAMP, UniqueConstraint

from src.infrastructure.database.base import Base


class InventoryLotModel(Base):
    __tablename__ = "inventory_lot"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    item_id = Column(BigInteger, ForeignKey("item.id"), nullable=False)
    lot_code = Column(String(50), nullable=False)
    expiration_date = Column(TIMESTAMP, nullable=True)
    production_date = Column(TIMESTAMP, nullable=True)
    unit_cost = Column(Numeric(18, 6), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)

    __table_args__ = (UniqueConstraint("item_id", "lot_code", name="uq_inventory_lot_item_code"),)

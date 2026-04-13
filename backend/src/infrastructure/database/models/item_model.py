from sqlalchemy import Column, BigInteger, String, Boolean, Numeric, Integer, TIMESTAMP
from sqlalchemy.orm import declarative_base
from src.infrastructure.database.base import Base

class ItemModel(Base):
    __tablename__ = "item"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    item_type_id = Column(Integer, nullable=False)
    brand_id = Column(Integer, nullable=False)
    base_uom_id = Column(Integer, nullable=False)
    is_stockable = Column(Boolean, nullable=False)
    is_batch_tracked = Column(Boolean, nullable=False)
    min_stock_level = Column(Numeric(14, 4), nullable=False)
    is_manufacturable = Column(Boolean, nullable=False)
    is_purchasable = Column(Boolean, nullable=False)
    is_sellable = Column(Boolean, nullable=False)
    status = Column(String(20), default="ACTIVE", nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)
    updated_at = Column(TIMESTAMP, nullable=True)
    deleted_at = Column(TIMESTAMP, nullable=True)
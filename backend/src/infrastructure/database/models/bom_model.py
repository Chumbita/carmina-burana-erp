from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy import func
from sqlalchemy.orm import relationship

from src.infrastructure.database.base import Base

class BomModel(Base):
    __tablename__ = "bom"
    
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    version = Column(Integer, nullable=False)
    base_quantity = Column(Float, nullable=False)
    base_unit = Column(String(10), nullable=False)
    standard_yield_pct = Column(Float, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    items = relationship("BomItemModel", cascade="all, delete-orphan")
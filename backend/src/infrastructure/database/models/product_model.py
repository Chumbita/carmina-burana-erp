from sqlalchemy import Column, String, Integer, Enum, Boolean, DateTime
from sqlalchemy.sql import func

from src.infrastructure.database.base import Base

class ProductModel(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    product_type = Column(Enum("BASE_BEER", "PACKAGED", "KEG", name="products_types"), nullable=False)
    unit = Column(String(10), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
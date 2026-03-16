from sqlalchemy import Column, Integer, Enum, Float, ForeignKey

from src.infrastructure.database.base import Base

class BomItemModel(Base):
    __tablename__ = "bom_items"
    
    id = Column(Integer, primary_key=True)
    bom_id = Column(Integer, ForeignKey("bom.id"), nullable=False)
    component_type = Column(Enum("MATERIAL", "PRODUCT", name="items_types"))
    input_id = Column(Integer, ForeignKey("inputs.id"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    quantity = Column(Float, nullable=False)
    
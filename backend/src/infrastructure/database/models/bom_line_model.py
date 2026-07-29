from sqlalchemy import Column, BigInteger, Integer, Numeric, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship

from src.infrastructure.database.base import Base


class BomLineModel(Base):
    __tablename__ = "bom_line"

    id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    bom_id = Column(BigInteger, ForeignKey("bom.id"), nullable=False)
    component_item_id = Column(BigInteger, ForeignKey("item.id"), nullable=False)
    quantity = Column(Numeric(14, 6), nullable=False)
    uom = Column(Integer, ForeignKey("uom.id"), nullable=True)
    created_at = Column(TIMESTAMP, nullable=False)

    bom = relationship("BomModel", back_populates="lines")
    component_item = relationship("ItemModel", foreign_keys=[component_item_id])
    uom_ref = relationship("UomModel", foreign_keys=[uom])
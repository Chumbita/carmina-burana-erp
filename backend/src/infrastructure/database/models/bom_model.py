from sqlalchemy import Column, BigInteger, Integer, Boolean, Date, TIMESTAMP, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from src.infrastructure.database.base import Base


class BomLineModel(Base):
    __tablename__ = "bom_line"

    id                = Column(BigInteger,  primary_key=True, autoincrement=True, nullable=False)
    bom_id            = Column(BigInteger,  ForeignKey("bom.id"), nullable=False)
    component_item_id = Column(BigInteger,  ForeignKey("item.id"), nullable=False)
    quantity          = Column(Numeric(14, 4), nullable=False)
    scrap_factor      = Column(Numeric(5, 4),  nullable=False, default=0)
    created_at        = Column(TIMESTAMP,   nullable=False)

    bom = relationship("BomModel", back_populates="lines")
    

class BomModel(Base):
    __tablename__ = "bom"
    
    id             = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    parent_item_id = Column(BigInteger, ForeignKey("item.id"), nullable=False)
    version        = Column(Integer, nullable=False)
    is_active      = Column(Boolean, nullable=False, default=False)
    valid_from     = Column(Date, nullable=False)
    valid_to       = Column(Date, nullable=True)
    created_at     = Column(TIMESTAMP, nullable=False)

    lines = relationship("BomLineModel", back_populates="bom", cascade="all, delete-orphan")

from sqlalchemy import Column, BigInteger, Integer, Boolean, Date, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship

from src.infrastructure.database.base import Base


class BomModel(Base):
    __tablename__ = "bom"

    id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    parent_item_id = Column(BigInteger, ForeignKey("item.id"), nullable=False)
    version = Column(Integer, nullable=False)
    is_active = Column(Boolean, nullable=False)
    valid_from = Column(Date, nullable=False)
    valid_to = Column(Date, nullable=True)
    created_at = Column(TIMESTAMP, nullable=False)

    lines = relationship("BomLineModel", back_populates="bom", cascade="all, delete-orphan")

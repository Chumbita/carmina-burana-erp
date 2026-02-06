from sqlalchemy import Column, Integer, String, Boolean, Numeric, UniqueConstraint
from src.infrastructure.database.base import Base

class InputModel(Base):
    __tablename__ = "inputs"

    __table_args__ = (
        UniqueConstraint("name", "brand", "category", name="uq_input_identity"),
    )

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    brand = Column(String(255))
    category = Column(String(255))
    unit = Column(String(50), nullable=False)
    minimum_stock = Column(Numeric(10, 2), nullable=False)
    image = Column(String(255))
    status = Column(Boolean, default=True)

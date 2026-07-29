from sqlalchemy import Column, BigInteger, String, Numeric, Integer, TIMESTAMP, ForeignKey
from src.infrastructure.database.base import Base

class BeerModel(Base):
    __tablename__ = "beer"

    item_id           = Column(BigInteger, ForeignKey("item.id"), primary_key=True, nullable=False)
    style             = Column(String(255), nullable=False)
    # asdecimal=False asegura que SQLAlchemy devuelva un float de Python y no un Decimal()
    abv               = Column(Numeric(5, 2, asdecimal=False), nullable=False)
    ibu               = Column(Integer, nullable=False)
    fermentation_days = Column(Integer, nullable=False)
    conditioning_days = Column(Integer, nullable=False)
    created_at        = Column(TIMESTAMP(timezone=False), nullable=False)
    updated_at        = Column(TIMESTAMP(timezone=False), nullable=True)
from sqlalchemy import Column, BigInteger, SmallInteger, Numeric, Integer, TIMESTAMP, ForeignKey

from src.infrastructure.database.base import Base


class ProductModel(Base):
    __tablename__ = "product"

    item_id      = Column(BigInteger,     ForeignKey("item.id"), primary_key=True, nullable=False)
    product_type_id = Column(SmallInteger,   ForeignKey("product_type.id"), nullable=False)
    net_content  = Column(Numeric(14, 4), nullable=False)
    packaging_size = Column(Integer,      nullable=False)
    created_at   = Column(TIMESTAMP,      nullable=False)
    updated_at   = Column(TIMESTAMP,      nullable=True)
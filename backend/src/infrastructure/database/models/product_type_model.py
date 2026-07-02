from sqlalchemy import Column, SmallInteger, String

from src.infrastructure.database.base import Base


class ProductTypeModel(Base):
    __tablename__ = "product_type"

    id   = Column(SmallInteger, primary_key=True, autoincrement=True, nullable=False)
    code = Column(String(30),   nullable=False, unique=True)
    name = Column(String(50),   nullable=False)
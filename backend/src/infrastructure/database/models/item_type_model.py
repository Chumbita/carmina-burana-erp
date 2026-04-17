from sqlalchemy import Column, SmallInteger, String
from src.infrastructure.database.base import Base

class ItemTypeModel(Base):
    __tablename__ = "item_type"

    id = Column(SmallInteger, primary_key=True, autoincrement=True)
    code = Column(String(30), nullable=False, unique=True)
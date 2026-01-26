from sqlalchemy import Column, Integer, Date, String, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from src.infrastructure.database.base import Base

class InputEntryModel(Base):
    __tablename__ = "inputs_entries"

    id = Column(Integer, primary_key=True)
    id_supplier = Column(Integer, nullable=False)
    entry_date = Column(Date, nullable=False)
    document_number = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=func.now())

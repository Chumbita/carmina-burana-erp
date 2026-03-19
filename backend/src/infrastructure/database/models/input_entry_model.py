from sqlalchemy import Column, Integer, Date, String, TIMESTAMP, Numeric
from sqlalchemy.sql import func
from src.infrastructure.database.base import Base

class InputEntryModel(Base):
    __tablename__ = "inputs_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reception_number = Column(String(255), nullable=False, unique=True)
    entry_date = Column(Date, nullable=False)
    supplier = Column(String(255), nullable=False)
    total_cost = Column(Numeric(10, 2), nullable=False)
    description = Column(String(500), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
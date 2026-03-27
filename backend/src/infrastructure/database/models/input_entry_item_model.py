from sqlalchemy import Column, Integer, Date, String, Numeric, ForeignKey
from src.infrastructure.database.base import Base

class InputEntryItemModel(Base):
    __tablename__ = "inputs_entries_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_entry = Column(Integer, ForeignKey("inputs_entries.id"), nullable=False)
    id_input = Column(Integer, ForeignKey("inputs.id"), nullable=False)
    
    amount = Column(Numeric(10, 2), nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=False)
    expire_date = Column(Date, nullable=False)
    comment = Column(String(500), nullable=True)
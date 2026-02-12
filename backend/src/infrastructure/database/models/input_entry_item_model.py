from sqlalchemy import Column, Integer, ForeignKey, Numeric, Date
from src.infrastructure.database.base import Base

class InputEntryItemModel(Base):
    __tablename__ = "inputs_entries_items"

    id = Column(Integer, primary_key=True)

    id_entry = Column(Integer, ForeignKey("inputs_entries.id"), nullable=False)
    id_input = Column(Integer, ForeignKey("inputs.id"), nullable=False)

    amount = Column(Numeric(10, 2), nullable=False)
    expire_date = Column(Date)

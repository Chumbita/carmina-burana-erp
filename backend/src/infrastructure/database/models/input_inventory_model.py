from sqlalchemy import Column, Integer, ForeignKey, Numeric, Date, TIMESTAMP
from sqlalchemy.sql import func
from src.infrastructure.database.base import Base

class InputInventoryModel(Base):
    __tablename__ = "inputs_inventory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_entry_item = Column(Integer, ForeignKey("inputs_entries_items.id"), nullable=False)
    id_input = Column(Integer, ForeignKey("inputs.id"), nullable=False)
    initial_amount = Column(Numeric(10, 2), nullable=False)
    current_amount = Column(Numeric(10, 2), nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=False)
    expire_date = Column(Date, nullable=False)
    last_updated = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
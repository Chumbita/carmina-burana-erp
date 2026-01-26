from sqlalchemy import Column, Integer, ForeignKey, Numeric, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from src.infrastructure.database.base import Base

class InputInventoryModel(Base):
    __tablename__ = "inputs_inventory"

    id = Column(Integer, primary_key=True)

    id_entry_item = Column(Integer, ForeignKey("inputs_entries_items.id"), nullable=False)

    current_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Boolean, default=True)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

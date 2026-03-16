from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from src.infrastructure.database.base import Base


class InputMovementModel(Base):
    __tablename__ = "input_movements"

    id = Column(String, primary_key=True)
    input_id = Column(Integer, ForeignKey("inputs.id"), nullable=False)
    event_type = Column(String(20), nullable=False)
    snapshot = Column(JSONB, nullable=False)
    occurred_at = Column(TIMESTAMP(timezone=True), nullable=False)
    performed_by = Column(String, ForeignKey("users.id"), nullable=True)

    # Relationships
    input_ref = relationship("InputModel", foreign_keys=[input_id])
    user_ref = relationship("UserModel", foreign_keys=[performed_by])

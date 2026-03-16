from sqlalchemy import BigInteger, Column, Integer, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import JSONB

from src.infrastructure.database.base import Base


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id          = Column(BigInteger,  primary_key=True, autoincrement=True)
    user_id     = Column(Integer,     nullable=True)
    entity_type = Column(String(255), nullable=False)
    entity_id   = Column(Integer,     nullable=False)
    action      = Column(String(20),  nullable=False)
    old_data    = Column(JSONB,       nullable=True)
    new_data    = Column(JSONB,       nullable=True)
    created_at  = Column(TIMESTAMP(timezone=True), nullable=False, server_default="now()")

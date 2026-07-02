from sqlalchemy import Column, BigInteger, Numeric, VARCHAR, Date, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship

from src.infrastructure.database.base import Base


class ProductionConsumptionModel(Base):
    __tablename__ = "production_consumption"

    id                  = Column(BigInteger,     primary_key=True, autoincrement=True, nullable=False)
    production_order_id = Column(BigInteger,     ForeignKey("production_order.id"), nullable=False)
    item_id             = Column(BigInteger,     ForeignKey("item.id"), nullable=False)
    lot_id              = Column(BigInteger,     ForeignKey("inventory_lot.id"), nullable=False)
    quantity            = Column(Numeric(14, 6), nullable=False)
    created_at          = Column(TIMESTAMP,      nullable=False)

    production_order = relationship("ProductionOrderModel", back_populates="consumptions")


class ProductionOutputModel(Base):
    __tablename__ = "production_output"

    id                  = Column(BigInteger,     primary_key=True, autoincrement=True, nullable=False)
    production_order_id = Column(BigInteger,     ForeignKey("production_order.id"), nullable=False)
    item_id             = Column(BigInteger,     ForeignKey("item.id"), nullable=False)
    lot_id              = Column(BigInteger,     ForeignKey("inventory_lot.id"), nullable=False)
    quantity            = Column(Numeric(14, 6), nullable=False)
    created_at          = Column(TIMESTAMP,      nullable=False)

    production_order = relationship("ProductionOrderModel", back_populates="outputs")


class ProductionOrderModel(Base):
    __tablename__ = "production_order"

    id                = Column(BigInteger,     primary_key=True, autoincrement=True, nullable=False)
    item_id           = Column(BigInteger,     ForeignKey("item.id"), nullable=False)
    bom_id            = Column(BigInteger,     ForeignKey("bom.id"), nullable=False)
    planned_quantity  = Column(Numeric(14, 4), nullable=False)
    produced_quantity = Column(Numeric(14, 4), nullable=False, default=0)
    status            = Column(VARCHAR(20),    nullable=False, default="PLANNED")
    schedule_date     = Column(Date,           nullable=True)
    completed_at      = Column(TIMESTAMP,      nullable=True)
    description       = Column(VARCHAR(255),   nullable=True)
    created_at        = Column(TIMESTAMP,      nullable=False)

    consumptions = relationship("ProductionConsumptionModel", back_populates="production_order", cascade="all, delete-orphan")
    outputs      = relationship("ProductionOutputModel",      back_populates="production_order", cascade="all, delete-orphan")
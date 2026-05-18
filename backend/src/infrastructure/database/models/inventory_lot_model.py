from sqlalchemy import Column, BigInteger, String, Numeric, TIMESTAMP, UniqueConstraint
from sqlalchemy.orm import relationship

from src.infrastructure.database.base import Base


class InventoryLotModel(Base):
    __tablename__ = "inventory_lot"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    item_id = Column(BigInteger, nullable=False)
    lot_code= Column(String, nullable=False)
    expiration_date = Column(TIMESTAMP, nullable=True)
    production_date = Column(TIMESTAMP, nullable=True)
    unit_cost = Column(Numeric(18, 6), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)

    # Restriccion para que no existan dos filas con el mismo item_id y lot_code. En pocas palabras, define una clave única compuesta.
    __table_args__ = (
        UniqueConstraint("item_id", "lot_code", name="inventory_lot_index_0"),
    )

    # Relaciones hacia los otros modelos
    balance = relationship(
        "InventoryBalanceModel",
        back_populates="lot"
    )
    transactions = relationship(
        "InventoryTransactionModel",
        back_populates="lot"
    )
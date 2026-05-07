"""add inventory lot and balance tables

Revision ID: c1a9b4f2d8e7
Revises: 7c03b45f2727
Create Date: 2026-05-07 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c1a9b4f2d8e7"
down_revision: Union[str, Sequence[str], None] = "7c03b45f2727"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "inventory_lot",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("item_id", sa.BigInteger(), nullable=False),
        sa.Column("lot_code", sa.String(length=50), nullable=False),
        sa.Column("expiration_date", sa.TIMESTAMP(), nullable=True),
        sa.Column("production_date", sa.TIMESTAMP(), nullable=True),
        sa.Column("unit_cost", sa.Numeric(precision=18, scale=6), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), nullable=False),
        sa.ForeignKeyConstraint(["item_id"], ["item.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("item_id", "lot_code", name="uq_inventory_lot_item_code"),
    )

    op.create_table(
        "inventory_balance",
        sa.Column("item_id", sa.BigInteger(), nullable=False),
        sa.Column("lot_id", sa.BigInteger(), nullable=True),
        sa.Column("quantity", sa.Numeric(precision=14, scale=4), nullable=False),
        sa.Column("reserved_quantity", sa.Numeric(precision=14, scale=4), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(), nullable=False),
        sa.ForeignKeyConstraint(["item_id"], ["item.id"]),
        sa.ForeignKeyConstraint(["lot_id"], ["inventory_lot.id"]),
        sa.PrimaryKeyConstraint("item_id"),
    )
    op.create_index("ix_inventory_balance_item_lot", "inventory_balance", ["item_id", "lot_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_inventory_balance_item_lot", table_name="inventory_balance")
    op.drop_table("inventory_balance")
    op.drop_table("inventory_lot")

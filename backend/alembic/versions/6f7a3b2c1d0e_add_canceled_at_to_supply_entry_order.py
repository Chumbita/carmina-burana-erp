"""add canceled_at to supply_entry_order

Revision ID: 6f7a3b2c1d0e
Revises: c02f140f8d9c
Create Date: 2026-07-01 16:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6f7a3b2c1d0e"
down_revision: Union[str, Sequence[str], None] = "c02f140f8d9c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "supply_entry_order",
        sa.Column("canceled_at", sa.TIMESTAMP(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("supply_entry_order", "canceled_at")

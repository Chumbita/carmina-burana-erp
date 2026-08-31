"""add_reason_to_inventory_transaction

Revision ID: 9f8e7d6c5b4a
Revises: 8c1d2e3f4a5b
Create Date: 2026-08-27

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9f8e7d6c5b4a"
down_revision: Union[str, Sequence[str], None] = "8c1d2e3f4a5b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("inventory_transaction", sa.Column("reason", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("inventory_transaction", "reason")

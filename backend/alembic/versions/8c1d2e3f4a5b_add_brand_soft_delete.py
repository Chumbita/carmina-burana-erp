"""add_brand_soft_delete

Revision ID: 8c1d2e3f4a5b
Revises: 7b9c2d4e8f10
Create Date: 2026-08-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8c1d2e3f4a5b"
down_revision: Union[str, Sequence[str], None] = "7b9c2d4e8f10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "brand",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.add_column("brand", sa.Column("updated_at", sa.TIMESTAMP(), nullable=True))
    op.add_column("brand", sa.Column("deleted_at", sa.TIMESTAMP(), nullable=True))
    op.alter_column("brand", "is_active", server_default=None)


def downgrade() -> None:
    op.drop_column("brand", "deleted_at")
    op.drop_column("brand", "updated_at")
    op.drop_column("brand", "is_active")

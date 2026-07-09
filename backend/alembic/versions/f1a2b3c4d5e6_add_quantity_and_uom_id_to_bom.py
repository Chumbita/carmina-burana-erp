"""add quantity and uom_id to bom

Revision ID: f1a2b3c4d5e6
Revises: e7d129883e7a
Create Date: 2026-06-30 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'e7d129883e7a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Add columns as nullable temporarily
    op.add_column('bom', sa.Column('quantity', sa.Numeric(14, 6), nullable=True))
    op.add_column('bom', sa.Column('uom_id', sa.Integer(), nullable=True))

    # 2. Backfill existing rows: quantity=1, uom_id from parent item's base_uom_id
    op.execute("""
        UPDATE bom
        SET quantity = 1,
            uom_id = item.base_uom_id
        FROM item
        WHERE bom.parent_item_id = item.id
          AND bom.uom_id IS NULL
    """)

    # 3. Add FK constraint for uom_id
    op.create_foreign_key('fk_bom_uom_id', 'bom', 'uom', ['uom_id'], ['id'])

    # 4. Set NOT NULL after backfill
    op.alter_column('bom', 'quantity', nullable=False)
    op.alter_column('bom', 'uom_id', nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_bom_uom_id', 'bom', type_='foreignkey')
    op.drop_column('bom', 'uom_id')
    op.drop_column('bom', 'quantity')

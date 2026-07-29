"""fix_inventory_balance_unique

Revision ID: a606a4ebf4f7
Revises: f6ebb24ee762
Create Date: 2026-05-19 03:18:21.440647

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a606a4ebf4f7'
down_revision: Union[str, Sequence[str], None] = 'f6ebb24ee762'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

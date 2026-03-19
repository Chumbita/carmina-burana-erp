"""merge_heads

Revision ID: 50be19c72b15
Revises: 2e3ea2333359, c3d4e5f6a1b2
Create Date: 2026-03-19 13:11:36.498160

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '50be19c72b15'
down_revision: Union[str, Sequence[str], None] = ('2e3ea2333359', 'c3d4e5f6a1b2')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

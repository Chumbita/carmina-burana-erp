"""merge_branches_from_a606a4ebf4f7

Revision ID: 4e6dd76d454e
Revises: 2dee8b06ae79, a1b2c3d4e5f6, d6ad6fe087ad
Create Date: 2026-07-29 18:59:40.183788

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4e6dd76d454e'
down_revision: Union[str, Sequence[str], None] = ('2dee8b06ae79', 'a1b2c3d4e5f6', 'd6ad6fe087ad')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

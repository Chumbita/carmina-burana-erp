"""InventoryEngine_and_SupplyEntry

Revision ID: f6ebb24ee762
Revises: b8e7ddcfbe16
Create Date: 2026-05-19 02:43:59.574990

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f6ebb24ee762'
down_revision: Union[str, Sequence[str], None] = 'b8e7ddcfbe16'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

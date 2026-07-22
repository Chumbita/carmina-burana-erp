"""add indexes to audit_logs

Revision ID: a1b2c3d4e5f6
Revises: 6f7a3b2c1d0e
Create Date: 2026-07-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '6f7a3b2c1d0e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index('ix_audit_logs_entity_type_id', 'audit_logs', ['entity_type', 'entity_id'])
    op.create_index('ix_audit_logs_user_id', 'audit_logs', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_audit_logs_entity_type_id', table_name='audit_logs')
    op.drop_index('ix_audit_logs_user_id', table_name='audit_logs')

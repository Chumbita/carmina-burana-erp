"""create_audit_logs_table

Revision ID: b2c3d4e5f6a1
Revises: a1b2c3d4e5f6
Create Date: 2026-03-16 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision = 'b2c3d4e5f6a1'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "audit_logs",
        sa.Column("id",          sa.BigInteger(),  primary_key=True, autoincrement=True),
        sa.Column("user_id",     sa.Integer(),     nullable=True),
        sa.Column("entity_type", sa.String(255),   nullable=False),
        sa.Column("entity_id",   sa.Integer(),     nullable=False),
        sa.Column("action",      sa.String(20),    nullable=False),
        sa.Column("old_data",    JSONB,            nullable=True),
        sa.Column("new_data",    JSONB,            nullable=True),
        sa.Column("created_at",  sa.TIMESTAMP(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    op.create_check_constraint(
        "ck_audit_logs_action",
        "audit_logs",
        "action IN ('CREATED', 'UPDATED')",
    )

    op.create_index("ix_audit_logs_entity", "audit_logs", ["entity_type", "entity_id"])
    op.create_index("ix_audit_logs_user_id",    "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])


def downgrade() -> None:
    op.drop_table("audit_logs")

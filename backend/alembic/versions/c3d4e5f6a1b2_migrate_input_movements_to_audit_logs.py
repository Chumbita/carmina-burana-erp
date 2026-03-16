"""migrate_input_movements_to_audit_logs

Revision ID: c3d4e5f6a1b2
Revises: b2c3d4e5f6a1
Create Date: 2026-03-16 10:30:00.000000

"""
from alembic import op
from sqlalchemy import text
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'c3d4e5f6a1b2'
down_revision = 'b2c3d4e5f6a1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # Insertar registros de input_movements en audit_logs
    conn.execute(text("""
        INSERT INTO audit_logs (
            user_id,
            entity_type,
            entity_id,
            action,
            old_data,
            new_data,
            created_at
        )
        SELECT
            performed_by::integer          AS user_id,
            'input'                       AS entity_type,
            input_id                      AS entity_id,
            event_type                    AS action,
            snapshot -> 'before'          AS old_data,
            snapshot -> 'after'           AS new_data,
            occurred_at                   AS created_at
        FROM input_movements
        ORDER BY occurred_at ASC
    """))

    # Verificar que todos los registros fueron migrados
    original_count = conn.execute(
        text("SELECT COUNT(*) FROM input_movements")
    ).scalar()

    migrated_count = conn.execute(
        text("SELECT COUNT(*) FROM audit_logs WHERE entity_type = 'input'")
    ).scalar()

    if original_count != migrated_count:
        raise Exception(
            f"Migración incompleta: {original_count} registros en input_movements, "
            f"pero solo {migrated_count} migrados a audit_logs."
        )

    # Eliminar tabla vieja solo si la verificación pasó
    op.drop_table('input_movements')


def downgrade() -> None:
    # Recrear input_movements y restaurar datos desde audit_logs
    # Nota: el id original no se preserva, se reasigna
    conn = op.get_bind()

    op.create_table('input_movements',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('input_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(length=20), nullable=False),
        sa.Column('snapshot', sa.JSON(), nullable=False),
        sa.Column('occurred_at', sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column('performed_by', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['input_id'], ['inputs.id'], ),
        sa.ForeignKeyConstraint(['performed_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_check_constraint('ck_input_movements_event_type', 'input_movements', "event_type IN ('CREATED', 'UPDATED')")
    op.create_index('ix_input_movements_input_id', 'input_movements', ['input_id'])
    op.create_index('ix_input_movements_occurred_at', 'input_movements', ['occurred_at'])

    conn.execute(text("""
        INSERT INTO input_movements (
            id,
            input_id,
            event_type,
            snapshot,
            occurred_at,
            performed_by
        )
        SELECT
            gen_random_uuid()::text                     AS id,
            entity_id                                   AS input_id,
            action                                      AS event_type,
            json_build_object('before', old_data,
                               'after',  new_data)      AS snapshot,
            created_at                                  AS occurred_at,
            user_id::text                               AS performed_by
        FROM audit_logs
        WHERE entity_type = 'input'
        ORDER BY created_at ASC
    """))

    conn.execute(text(
        "DELETE FROM audit_logs WHERE entity_type = 'input'"
    ))

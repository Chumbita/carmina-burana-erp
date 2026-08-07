"""init schema with active models

Revision ID: b8e7ddcfbe16
Revises: 
Create Date: 2026-06-26 13:22:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b8e7ddcfbe16'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. brand
    op.create_table(
        'brand',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # 2. item_type
    op.create_table(
        'item_type',
        sa.Column('id', sa.SmallInteger(), autoincrement=True, nullable=False),
        sa.Column('code', sa.String(length=30), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )

    # 3. uom
    op.create_table(
        'uom',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('symbol', sa.String(length=10), nullable=False),
        sa.Column('uom_type', sa.String(length=20), nullable=False),
        sa.Column('factor_to_base', sa.Numeric(precision=24, scale=10), nullable=True),
        sa.Column('is_base', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # 4. users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('password', sa.String(), nullable=False),
        sa.Column('role', sa.Enum('admin', 'host', name='user_roles'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username')
    )

    # 5. item
    op.create_table(
        'item',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('item_type_id', sa.SmallInteger(), nullable=False),
        sa.Column('brand_id', sa.Integer(), nullable=False),
        sa.Column('base_uom_id', sa.Integer(), nullable=False),
        sa.Column('is_stockable', sa.Boolean(), nullable=False),
        sa.Column('is_batch_tracked', sa.Boolean(), nullable=False),
        sa.Column('min_stock_level', sa.Numeric(precision=14, scale=4), nullable=False),
        sa.Column('is_manufacturable', sa.Boolean(), nullable=False),
        sa.Column('is_purchasable', sa.Boolean(), nullable=False),
        sa.Column('is_sellable', sa.Boolean(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=True),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['base_uom_id'], ['uom.id']),
        sa.ForeignKeyConstraint(['brand_id'], ['brand.id']),
        sa.ForeignKeyConstraint(['item_type_id'], ['item_type.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # 6. supply
    op.create_table(
        'supply',
        sa.Column('item_id', sa.BigInteger(), nullable=False),
        sa.Column('supply_category', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['item_id'], ['item.id']),
        sa.PrimaryKeyConstraint('item_id')
    )

    # 7. inventory_lot
    op.create_table(
        'inventory_lot',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('item_id', sa.BigInteger(), nullable=False),
        sa.Column('lot_code', sa.String(), nullable=False),
        sa.Column('expiration_date', sa.TIMESTAMP(), nullable=True),
        sa.Column('production_date', sa.TIMESTAMP(), nullable=True),
        sa.Column('unit_cost', sa.Numeric(precision=18, scale=6), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('item_id', 'lot_code', name='inventory_lot_index_0')
    )

    # 8. supplier
    op.create_table(
        'supplier',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=255), nullable=True),
        sa.Column('address', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # 9. inventory_balance
    op.create_table(
        'inventory_balance',
        sa.Column('item_id', sa.BigInteger(), nullable=False),
        sa.Column('lot_id', sa.BigInteger(), nullable=False),
        sa.Column('quantity', sa.Numeric(precision=14, scale=4), nullable=False),
        sa.Column('reserved_quantity', sa.Numeric(precision=14, scale=4), nullable=False, server_default='0'),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['lot_id'], ['inventory_lot.id']),
        sa.PrimaryKeyConstraint('lot_id')
    )

    # 10. inventory_transaction
    op.create_table(
        'inventory_transaction',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('item_id', sa.BigInteger(), nullable=False),
        sa.Column('lot_id', sa.BigInteger(), nullable=False),
        sa.Column('quantity', sa.Numeric(precision=14, scale=4), nullable=False),
        sa.Column('transaction_type', sa.String(), nullable=False),
        sa.Column('reference_type', sa.String(), nullable=False),
        sa.Column('reference_id', sa.BigInteger(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['lot_id'], ['inventory_lot.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # 11. supply_entry_order
    op.create_table(
        'supply_entry_order',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('supplier_id', sa.Integer(), nullable=True),
        sa.Column('document_number', sa.String(length=50), nullable=False),
        sa.Column('entry_date', sa.TIMESTAMP(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['supplier_id'], ['supplier.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # 12. supply_entry_line
    op.create_table(
        'supply_entry_line',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('supply_entry_id', sa.BigInteger(), nullable=False),
        sa.Column('item_id', sa.BigInteger(), nullable=False),
        sa.Column('quantity', sa.Numeric(precision=14, scale=4), nullable=False),
        sa.Column('unit_cost', sa.Numeric(precision=18, scale=6), nullable=False),
        sa.Column('expiration_date', sa.TIMESTAMP(), nullable=False),
        sa.Column('lot_code', sa.String(length=50), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['item_id'], ['item.id']),
        sa.ForeignKeyConstraint(['supply_entry_id'], ['supply_entry_order.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # 13. audit_logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('entity_type', sa.String(length=255), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(length=20), nullable=False),
        sa.Column('old_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('new_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # Drop tables in reverse order of creation
    op.drop_table('audit_logs')
    op.drop_table('supply_entry_line')
    op.drop_table('supply_entry_order')
    op.drop_table('inventory_transaction')
    op.drop_table('inventory_balance')
    op.drop_table('supplier')
    op.drop_table('inventory_lot')
    op.drop_table('supply')
    op.drop_table('item')
    op.drop_table('users')
    op.drop_table('uom')
    op.drop_table('item_type')
    op.drop_table('brand')

    # Drop custom enums
    sa.Enum(name='user_roles').drop(op.get_bind(), checkfirst=True)

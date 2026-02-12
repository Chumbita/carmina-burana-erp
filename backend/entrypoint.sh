#!/bin/bash
set -e

echo "=========================================="
echo "🚀 Carmina Burana ERP - Backend Startup"
echo "=========================================="

# Extract database connection details from DATABASE_URL using Python
# Format: postgresql+asyncpg://user:password@host:port/dbname
read DB_USER DB_PASSWORD DB_HOST DB_PORT DB_NAME <<< $(python3 -c "
import re
from urllib.parse import urlparse
url = '$DATABASE_URL'
# Remove the driver part (postgresql+asyncpg -> postgresql)
url = url.replace('+asyncpg', '').replace('+psycopg2', '')
parsed = urlparse(url)
print(parsed.username, parsed.password, parsed.hostname, parsed.port or 5432, parsed.path.lstrip('/'))
")

echo ""
echo "📊 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Step 1: Wait for PostgreSQL to be ready
echo "⏳ Step 1: Waiting for PostgreSQL to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ ERROR: PostgreSQL did not become ready in time"
        exit 1
    fi
    echo "   Attempt $RETRY_COUNT/$MAX_RETRIES - PostgreSQL not ready yet, waiting..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"
echo ""

# Step 2: Check database connection
echo "⏳ Step 2: Verifying database connection..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ ERROR: Cannot connect to database"
    exit 1
fi
echo ""

# Step 3: Check and apply Alembic migrations
echo "⏳ Step 3: Checking Alembic migrations..."

# Check current migration status
CURRENT_REVISION=$(alembic current 2>/dev/null | grep -oP '(?<=\(head\) )[a-f0-9]+' || echo "none")
HEAD_REVISION=$(alembic heads 2>/dev/null | grep -oP '^[a-f0-9]+' || echo "none")

echo "   Current revision: $CURRENT_REVISION"
echo "   Head revision: $HEAD_REVISION"

if [ "$CURRENT_REVISION" = "$HEAD_REVISION" ] && [ "$CURRENT_REVISION" != "none" ]; then
    echo "✅ Database is up to date - no migrations needed"
else
    echo "📝 Applying pending migrations..."
    if alembic upgrade head; then
        echo "✅ Migrations applied successfully!"
    else
        echo "❌ ERROR: Failed to apply migrations"
        exit 1
    fi
fi
echo ""

# Step 4: Start FastAPI server
echo "=========================================="
echo "🎯 Starting FastAPI server..."
echo "=========================================="
echo ""

# Start uvicorn with hot-reload enabled for development
exec uvicorn src.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    --log-level info

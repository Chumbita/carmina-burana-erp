#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Exit codes
EXIT_SUCCESS=0
EXIT_FAILURE=1

# Track overall health
ALL_HEALTHY=true

echo "=========================================="
echo "🏥 Carmina Burana ERP - Health Check"
echo "=========================================="
echo ""

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
fi

# Extract database connection details
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\(.*\)/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\(.*\):.*/\1/p')

# Check 1: PostgreSQL Container Running
echo -n "1. PostgreSQL Container Status... "
if docker ps --filter "name=carmina_db" --filter "status=running" | grep -q carmina_db; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ALL_HEALTHY=false
fi

# Check 2: PostgreSQL Accepting Connections
echo -n "2. PostgreSQL Connection... "
if docker exec carmina_db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ALL_HEALTHY=false
fi

# Check 3: Database Exists and Accessible
echo -n "3. Database Accessibility... "
if docker exec carmina_db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ALL_HEALTHY=false
fi

# Check 4: Backend Container Running
echo -n "4. Backend Container Status... "
if docker ps --filter "name=carmina_backend" --filter "status=running" | grep -q carmina_backend; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ALL_HEALTHY=false
fi

# Check 5: Backend Health Endpoint
echo -n "5. Backend Health Endpoint... "
BACKEND_PORT=${BACKEND_PORT:-8000}
if curl -f -s "http://localhost:$BACKEND_PORT/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ALL_HEALTHY=false
fi

# Check 6: Frontend Container Running
echo -n "6. Frontend Container Status... "
if docker ps --filter "name=carmina_frontend" --filter "status=running" | grep -q carmina_frontend; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ALL_HEALTHY=false
fi

# Check 7: Frontend Serving
echo -n "7. Frontend Service... "
FRONTEND_PORT=${FRONTEND_PORT:-5173}
if curl -f -s "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ALL_HEALTHY=false
fi

# Check 8: Alembic Migrations Status
echo -n "8. Database Migrations Status... "
MIGRATION_CHECK=$(docker exec carmina_backend alembic current 2>/dev/null)
if echo "$MIGRATION_CHECK" | grep -q "(head)"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} (migrations may be pending)"
fi

echo ""
echo "=========================================="

# Final result
if [ "$ALL_HEALTHY" = true ]; then
    echo -e "${GREEN}✅ All systems operational!${NC}"
    echo ""
    echo "Services available at:"
    echo "  • Frontend: http://localhost:$FRONTEND_PORT"
    echo "  • Backend:  http://localhost:$BACKEND_PORT"
    echo "  • Database: localhost:${POSTGRES_PORT:-5432}"
    exit $EXIT_SUCCESS
else
    echo -e "${RED}❌ Some systems are not healthy${NC}"
    echo ""
    echo "Run 'docker-compose logs [service]' to see detailed logs"
    exit $EXIT_FAILURE
fi

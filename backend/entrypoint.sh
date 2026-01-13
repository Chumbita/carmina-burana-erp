#!/bin/bash
set -e

# Aplicar migraciones de Alembic
alembic upgrade head

# Iniciar la aplicación
exec "$@"
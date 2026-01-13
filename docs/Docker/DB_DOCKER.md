# Dockerización de la Base de Datos PostgreSQL

Este documento explica cómo se configuró la base de datos PostgreSQL en Docker para el proyecto Carmina Burana ERP y soluciona problemas comunes.

## Estructura de Archivos

```
carmina-burana-erp/
├── docker-compose.yml    # Configuración de servicios Docker
├── .env                 # Variables de entorno
└── backend/
    └── alembic/         # Migraciones de la base de datos
```

## Configuración de PostgreSQL en Docker

### 1. Archivo docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: carmina-db
    restart: always
    env_file:
      - .env
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    ports:
      - "5433:5432"  # Puerto 5433 en el host, 5432 en el contenedor
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - carmina-network

networks:
  carmina-network:
    driver: bridge

volumes:
  postgres_data:
```

### 2. Archivo .env

```env
# PostgreSQL Configuration
POSTGRES_USER=tu-usuario
POSTGRES_PASSWORD=tu_contraseña_segura
POSTGRES_DB=nombre_de_tu_db
POSTGRES_PORT=5433

# Backend Configuration
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
```
POSTGRES_PASSWORD=tu_contraseña_segura
POSTGRES_DB=nombre-de-tu-db
POSTGRES_PORT=5433

# Backend Configuration
DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
```

## Despliegue

1. **Iniciar los contenedores**:
   ```bash
   docker compose up -d
   ```

2. **Verificar que el contenedor esté en ejecución**:
   ```bash
   docker ps
   ```

3. **Conectarse a la base de datos**:
   ```bash
   docker compose exec db psql -U postgres -d dbcarmina
   ```

## Comandos Útiles

- **Ver logs de la base de datos**:
  ```bash
  docker compose logs -f db
  ```

- **Hacer backup de la base de datos**:
  ```bash
  docker compose exec -T db pg_dump -U postgres dbcarmina > backup_$(date +%Y%m%d).sql
  ```

- **Restaurar base de datos desde backup**:
  ```bash
  cat backup.sql | docker compose exec -T db psql -U postgres dbcarmina
  ```

## Seguridad

1. **No subir el archivo `.env`** al repositorio (asegúrate de que esté en `.gitignore`)
2. **Usar contraseñas seguras** en producción
3. **Limitar el acceso** al puerto 5432 solo a la red interna de Docker

## Migraciones

Si estás usando un sistema de migraciones (como Alembic), asegúrate de ejecutar:

```bash
docker compose exec backend alembic upgrade head
```

## Conexión desde Herramientas Externas

Puedes conectarte a la base de datos usando cualquier cliente PostgreSQL con:

- **Host**: localhost
- **Puerto**: 5433 (o el que hayas configurado en POSTGRES_PORT)
- **Base de datos**: dbcarmina
- **Usuario**: postgres
- **Contraseña**: (la que hayas configurado en POSTGRES_PASSWORD)

## Limpieza

Para detener y eliminar los volúmenes (incluyendo los datos de la base de datos):

```bash
docker compose down -v
```

## Recursos Adicionales

- [Documentación oficial de PostgreSQL en Docker](https://hub.docker.com/_/postgres)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)

# Guía de Instalación con Docker para Carmina Burana ERP

¡Bienvenido/a a Carmina Burana ERP! Esta guía te ayudará a configurar el entorno de desarrollo utilizando Docker, incluso si nunca antes has trabajado con esta tecnología.

## Requisitos Previos

Antes de comenzar, necesitarás tener instalado en tu computadora:

1. **Docker Desktop** (para Windows/Mac) o **Docker Engine** (para Linux)
   - [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - [Instrucciones de instalación para Linux](https://docs.docker.com/engine/install/)
   - Versión mínima requerida: Docker 20.10.0+

2. **Git** (para clonar el repositorio)
   - [Descargar Git](https://git-scm.com/downloads)

## Pasos para Iniciar el Proyecto

### 1. Clonar el Repositorio

Abre una terminal y ejecuta:

```bash
git clone [URL_DEL_REPOSITORIO]
cd carmina-burana-erp
```

### 2. Verificar la Instalación de Docker

Antes de continuar, verifica que Docker esté instalado correctamente:

```bash
docker --version
docker compose version  # Nota: Usamos 'docker compose' (con espacio)
```

Deberías ver las versiones de Docker y Docker Compose instaladas.

### 3. Configuración del Entorno

El proyecto incluye los siguientes archivos de configuración:
- `docker-compose.yml` - Configuración de los servicios
- `Dockerfile.frontend` - Configuración del frontend (Vite + React)
- `Dockerfile.backend` - Configuración del backend (FastAPI)
- `.env` - Variables de entorno (debes crearlo basado en `.env.example` si existe)

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_contraseña_segura
POSTGRES_DB=dbcarmina
POSTGRES_PORT=5433

# Backend Configuration
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
SECRET_KEY=tu_clave_secreta_muy_larga_y_segura
ALLOWED_ORIGINS=["http://localhost:5173"]

# Frontend Configuration
VITE_API_URL=http://localhost:8000
```

### 5. Construir las Imágenes de Docker

Ejecuta el siguiente comando para construir las imágenes de los contenedores:

```bash
docker compose build
```

>  Este proceso puede tomar varios minutos la primera vez, ya que debe descargar todas las dependencias.

### 5. Iniciar los Contenedores

Una vez finalizada la construcción, inicia los servicios con:

```bash
docker compose up -d
```

### 6. Verificar que Todo Funcione

Después de unos segundos, verifica que los contenedores estén en ejecución:

```bash
docker compose ps
```

Deberías ver algo como:
```
NAME                   COMMAND                  SERVICE             STATUS              PORTS
carmina-frontend       "docker-entrypoint.s…"   frontend            running             0.0.0.0:3000->3000/tcp
carmina-backend        "uvicorn src.main:ap…"   backend             running             0.0.0.0:8000->8000/tcp
```

### 7. Acceder a la Aplicación

- **Frontend**: Abre tu navegador y visita http://localhost:3000
- **Backend (API)**: La API estará disponible en http://localhost:8000
- **Documentación de la API**: Visita http://localhost:8000/docs

## Solución de Problemas Comunes

### 1. Puerto 5432 en uso

Si ves un error como `port 5432 already in use`, significa que ya tienes una instancia de PostgreSQL ejecutándose en tu máquina local. Soluciones:

**Opción A:** Detener el servicio PostgreSQL local
```bash
# En Ubuntu/Debian
sudo systemctl stop postgresql


**Opción B:** Cambiar el puerto en el archivo `.env`
```env
POSTGRES_PORT=5433  # Cambia a un puerto disponible
```

### 2. Error de conexión a la base de datos

Si el backend no puede conectarse a la base de datos, verifica:

1. Que el contenedor de la base de datos esté en ejecución:
   ```bash
   docker ps | grep carmina-db
   ```

2. Los logs del contenedor de la base de datos:
   ```bash
   docker logs carmina-db
   ```

3. Que las credenciales en `.env` coincidan con las usadas en `docker-compose.yml`

### 3. Reconstruir contenedores

Si realizas cambios en los Dockerfiles o en la configuración, reconstruye las imágenes:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 4. Limpiar recursos no utilizados

Para liberar espacio y eliminar contenedores, redes e imágenes no utilizadas:

```bash
docker system prune -a
```

## Comandos Útiles

- **Iniciar los contenedores en segundo plano**:
  ```bash
  docker compose up -d
  ```

- **Ver logs en tiempo real**:
  ```bash
  # Ver todos los logs
  docker compose logs -f
  
  # Ver logs de un servicio específico
  docker compose logs -f backend
  ```

- **Acceder a la base de datos con psql**:
  ```bash
  docker exec -it carmina-db psql -U postgres -d dbcarmina
  ```

- **Reiniciar un servicio específico**:
  ```bash
  docker compose restart backend
  ```

- **Eliminar todos los volúmenes (¡cuidado, esto borrará los datos!)**:
  ```bash
  docker compose down -v
  ```

## Estructura de Redes

El proyecto utiliza una red llamada `carmina-network` para la comunicación entre contenedores:

```bash
# Ver redes disponibles
docker network ls

# Inspeccionar la red
docker network inspect carmina-burana-erp_carmina-network
```

## Volúmenes

Los datos de PostgreSQL se almacenan en un volumen llamado `carmina-burana-erp_postgres_data` para persistencia:

```bash
# Listar volúmenes
docker volume ls

# Inspeccionar un volumen específico
docker volume inspect carmina-burana-erp_postgres_data
```

## Migraciones con Alembic

El proyecto utiliza Alembic para el manejo de migraciones de la base de datos. Las migraciones se ejecutan automáticamente al iniciar el contenedor del backend.

Para crear una nueva migración:

```bash
docker compose exec backend alembic revision --autogenerate -m "Descripción del cambio"
```

Para aplicar migraciones pendientes:

```bash
docker compose exec backend alembic upgrade head
```

## Limpiar

Si necesitas liberar espacio o empezar de cero:

```bash
# Detener y eliminar contenedores
# Eliminar volúmenes (incluyendo la base de datos)
docker compose down -v

# Eliminar imágenes no utilizadas
docker system prune

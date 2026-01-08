# Guía de Instalación con Docker para Carmina Burana ERP

¡Bienvenido/a a Carmina Burana ERP! Esta guía te ayudará a configurar el entorno de desarrollo utilizando Docker, incluso si nunca antes has trabajado con esta tecnología.

## Requisitos Previos

Antes de comenzar, necesitarás tener instalado en tu computadora:

1. **Docker Desktop** (para Windows/Mac) o **Docker Engine** (para Linux)
   - [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - [Instrucciones de instalación para Linux](https://docs.docker.com/engine/install/)

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
docker-compose --version
```

Deberías ver las versiones de Docker y Docker Compose instaladas.

### 3. Configuración del Entorno

El proyecto ya incluye todos los archivos de configuración necesarios:
- `docker-compose.yml` - Configuración de los servicios
- `Dockerfile.frontend` - Configuración del frontend
- `Dockerfile.backend` - Configuración del backend

### 4. Construir las Imágenes de Docker

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

## Comandos Útiles

- **Ver logs del frontend**:
  ```bash
  docker compose logs -f frontend
  ```

- **Ver logs del backend**:
  ```bash
  docker compose logs -f backend
  ```

- **Detener los contenedores**:
  ```bash
  docker compose down
  ```

- **Reconstruir y reiniciar los contenedores** (útil después de cambios en los Dockerfiles):
  ```bash
  docker compose up -d --build
  ```

## Solución de Problemas Comunes

### Si los contenedores no se inician

1. Verifica que Docker esté en ejecución
2. Revisa los logs para ver el error específico:
   ```bash
   docker compose logs
   ```

### Si necesitas instalar dependencias adicionales

1. Para el frontend:
   ```bash
   docker compose exec frontend npm install [nombre-del-paquete]
   ```

2. Para el backend:
   ```bash
   docker compose exec backend pip install [nombre-del-paquete]
   ```

## Limpiar

Si necesitas liberar espacio o empezar de cero:

```bash
# Detener y eliminar contenedores
# Eliminar volúmenes (incluyendo la base de datos)
docker compose down -v

# Eliminar imágenes no utilizadas
docker system prune
```


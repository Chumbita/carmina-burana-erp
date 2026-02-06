# Carmina Burana ERP - Guía de Configuración y Despliegue

## 📋 Tabla de Contenidos
1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Arquitectura](#arquitectura)
3. [Requisitos Previos](#requisitos-previos)
4. [Configuración Inicial](#configuración-inicial)
5. [Levantar los Contenedores](#levantar-los-contenedores)
6. [Verificación del Sistema](#verificación-del-sistema)
7. [Solución de Problemas](#solución-de-problemas)
8. [Testing Realizado](#testing-realizado)

---

## 🎯 Resumen del Proyecto

Sistema ERP desarrollado con:
- **Backend**: FastAPI (Python) con arquitectura hexagonal/clean architecture
- **Frontend**: React + Vite + TailwindCSS
- **Base de Datos**: PostgreSQL 16
- **Containerización**: Docker + Docker Compose

---

## 🏗️ Arquitectura

### Backend (FastAPI)
```
backend/
├── src/
│   ├── application/          # Casos de uso
│   │   └── use_cases/
│   │       └── auth/
│   │           └── login_use_case.py
│   ├── domain/               # Entidades y lógica de negocio
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── services/
│   ├── infrastructure/       # Implementaciones técnicas
│   │   ├── database/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   └── session.py
│   │   ├── security/
│   │   │   ├── jwt_handler.py
│   │   │   └── password_hasher.py (Argon2)
│   │   └── config/
│   │       └── settings.py
│   └── presentation/         # API y routers
│       ├── api/routers/
│       │   └── auth_router.py
│       └── middleware/
│           └── cors.py
├── alembic/                  # Migraciones de BD
└── entrypoint.sh            # Script de inicialización
```

### Frontend (React)
```
frontend/
├── src/
│   ├── features/auth/
│   │   ├── components/LoginForm.jsx
│   │   ├── services/authService.js
│   │   └── pages/LoginPage.jsx
│   ├── lib/api/
│   │   ├── publicClient.js   # Cliente HTTP sin auth
│   │   ├── privateClient.js  # Cliente HTTP con auth
│   │   └── endpoints.js
│   └── app/
│       ├── providers/AuthContext.jsx
│       └── routes/
```

---

## 📦 Requisitos Previos

- Docker >= 20.10
- Docker Compose >= 2.0
- Puertos disponibles: 3000 (frontend), 8000 (backend), 5432 (postgres)

---

## ⚙️ Configuración Inicial

### 1. Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=dbcarmina
POSTGRES_PORT=5432
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/dbcarmina

# Backend Configuration
BACKEND_PORT=8000
API_BASE_URL=http://localhost:8000
SECRET_KEY="tu_secret_key_aqui"
ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"

# JWT Configuration
JWT_ALGORITHM="HS256"
JWT_EXPIRATION_MINUTES=1440

# Frontend Configuration
VITE_API_URL=http://localhost:8000
FRONTEND_PORT=3000
```

### 2. Credenciales de Usuario Administrador

Las credenciales por defecto están configuradas en `backend/src/infrastructure/config/settings.py`:

```python
ADMIN_USERNAME: str = "admin"
ADMIN_PASSWORD: str = "admin123"
ADMIN_FULL_NAME: str = "Administrador"
```

---

## 🚀 Levantar los Contenedores

### Opción 1: Primera vez (Limpio)

```bash
# 1. Navegar al directorio del proyecto
cd /home/aldo/Escritorio/Prog/carmina-burana-erp

# 2. Levantar todos los servicios
docker-compose up -d

# 3. Verificar que todos los contenedores estén corriendo
docker-compose ps
```

### Opción 2: Reiniciar después de cambios en .env

```bash
# 1. Detener todos los contenedores
docker-compose down

# 2. Levantar con las nuevas variables de entorno
docker-compose up -d
```

### Opción 3: Recrear solo un servicio específico

```bash
# Recrear solo el backend (útil después de cambios en código o .env)
docker-compose up -d --force-recreate backend

# Recrear solo el frontend
docker-compose up -d --force-recreate frontend
```

### Proceso de Inicialización del Backend

El script `entrypoint.sh` ejecuta automáticamente:

1. ✅ **Espera a PostgreSQL** - Verifica que la BD esté lista
2. ✅ **Verifica conexión** - Prueba la conexión a la base de datos
3. ✅ **Aplica migraciones** - Ejecuta `alembic upgrade head`
4. ✅ **Inicia servidor** - Levanta FastAPI con Uvicorn

---

## 🔍 Verificación del Sistema

### 1. Verificar Estado de Contenedores

```bash
docker-compose ps
```

Deberías ver:
```
NAME               STATUS                   PORTS
carmina_backend    Up (healthy)             0.0.0.0:8000->8000/tcp
carmina_db         Up (healthy)             0.0.0.0:5432->5432/tcp
carmina_frontend   Up (healthy)             0.0.0.0:3000->5173/tcp
```

### 2. Verificar Logs

```bash
# Ver logs del backend
docker-compose logs backend

# Ver logs en tiempo real
docker-compose logs -f backend

# Ver últimas 50 líneas
docker-compose logs --tail 50 backend
```

### 3. Verificar Endpoint de Health

```bash
curl http://localhost:8000/health
```

Respuesta esperada:
```json
{"status": "ok"}
```

### 4. Verificar Usuario en Base de Datos

```bash
docker-compose exec db psql -U postgres -d dbcarmina -c "SELECT id, username, role, is_active FROM users;"
```

Deberías ver el usuario administrador:
```
 id | username | role  | is_active
----+----------+-------+-----------
 0  | admin    | admin | t
```

---

## 🐛 Solución de Problemas

### Problema 1: Error 404 en Login

**Causa**: Variable de entorno `VITE_API_URL` incorrecta en el frontend.

**Solución**: 
- Verificar que en `.env` esté: `VITE_API_URL=http://localhost:8000`
- Los archivos `publicClient.js` y `privateClient.js` deben usar `import.meta.env.VITE_API_URL`

**Archivos corregidos**:
- `frontend/src/lib/api/publicClient.js`
- `frontend/src/lib/api/privateClient.js`

### Problema 2: Error CORS (400 Bad Request en OPTIONS)

**Causa**: El puerto del frontend (3000) no está en `ALLOWED_ORIGINS`.

**Solución**:
```env
ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
```

Luego recrear el backend:
```bash
docker-compose down
docker-compose up -d
```

### Problema 3: Usuario no existe en la base de datos

**Causa**: No se ejecutó el seeding de datos iniciales.

**Solución**: Insertar usuario manualmente:
```bash
docker-compose exec db psql -U postgres -d dbcarmina -c "INSERT INTO users (id, username, full_name, password, role, is_active, created_at) VALUES ('0', 'admin', 'admin', '\$argon2id\$v=19\$m=65536,t=3,p=4\$dE5pLeU8h3COEUJIKeVcqw\$bJZCrTseolTNv6cr3uS8LumRgdQPXyt34DiCp5PqWsc', 'admin', true, CURRENT_TIMESTAMP);"
```

**Nota**: El hash corresponde a la contraseña `admin`.

### Problema 4: Interceptores de Axios no funcionan

**Causa**: Variable mal nombrada en `privateClient.js` (usaba `apiClient` en lugar de `privateClient`).

**Solución**: Corregido en `frontend/src/lib/api/privateClient.js` líneas 13 y 25.

---

## 🧪 Testing Realizado

### 1. Test de Verificación de Password

Se creó un script temporal `test_login.py` para verificar:
- ✅ Usuario existe en la base de datos
- ✅ Hash de password es válido
- ✅ Verificación de password con Argon2 funciona correctamente

```bash
docker-compose exec backend python test_login.py
```

**Resultado**:
```
✅ User found:
   ID: 0
   Username: admin
   Role: admin
   Is Active: True
✅ Password verification SUCCESSFUL!
```

### 2. Test de Login via API (curl)

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

**Resultado esperado**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "0",
    "username": "admin",
    "full_name": "admin",
    "role": "admin"
  }
}
```

### 3. Test de CORS

```bash
# Verificar que el backend acepta peticiones desde localhost:3000
curl -X OPTIONS http://localhost:8000/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Resultado esperado**: Status 200 con headers CORS apropiados.

### 4. Test de Conexión a Base de Datos

```bash
# Verificar conexión
docker-compose exec db psql -U postgres -d dbcarmina -c '\conninfo'

# Listar tablas
docker-compose exec db psql -U postgres -d dbcarmina -c '\dt'
```

**Resultado esperado**:
```
          List of relations
 Schema |   Name   | Type  |  Owner
--------+----------+-------+----------
 public | inputs   | table | postgres
 public | users    | table | postgres
```

---

## 📝 Credenciales de Acceso

### Usuario Administrador
- **Username**: `admin`
- **Password**: `admin`
- **Role**: `admin`

### Acceso a la Aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Base de Datos**: localhost:5432

---

## 🔐 Seguridad

### Password Hashing
- **Algoritmo**: Argon2id
- **Configuración**: m=65536, t=3, p=4
- **Librería**: `passlib` con `argon2-cffi`

### JWT Tokens
- **Algoritmo**: HS256
- **Expiración**: 1440 minutos (24 horas)
- **Storage**: localStorage en el frontend

### CORS
- **Orígenes permitidos**: Configurables via `.env`
- **Credentials**: Habilitado
- **Methods**: Todos permitidos
- **Headers**: Todos permitidos

---

## 📊 Monitoreo

### Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo base de datos
docker-compose logs -f db

# Solo frontend
docker-compose logs -f frontend
```

### Inspeccionar contenedores

```bash
# Estado de salud
docker-compose ps

# Uso de recursos
docker stats

# Entrar a un contenedor
docker-compose exec backend bash
docker-compose exec db psql -U postgres -d dbcarmina
```

---

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores + volúmenes
docker-compose down -v

# Reconstruir imágenes
docker-compose build

# Reconstruir y levantar
docker-compose up -d --build
```

### Gestión de Base de Datos

```bash
# Backup de la base de datos
docker-compose exec db pg_dump -U postgres dbcarmina > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U postgres dbcarmina < backup.sql

# Conectarse a psql
docker-compose exec db psql -U postgres -d dbcarmina
```

### Migraciones con Alembic

```bash
# Crear nueva migración
docker-compose exec backend alembic revision --autogenerate -m "descripcion"

# Aplicar migraciones
docker-compose exec backend alembic upgrade head

# Ver estado actual
docker-compose exec backend alembic current

# Ver historial
docker-compose exec backend alembic history
```

---

## 📚 Recursos Adicionales

### Documentación de Tecnologías
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Alembic](https://alembic.sqlalchemy.org/)

### Estructura del Proyecto
- Ver `backend/README.md` para detalles de arquitectura del backend
- Ver `frontend/README.md` para detalles del frontend

---

## ✅ Checklist de Despliegue

- [ ] Archivo `.env` configurado correctamente
- [ ] Docker y Docker Compose instalados
- [ ] Puertos 3000, 8000, 5432 disponibles
- [ ] `docker-compose up -d` ejecutado exitosamente
- [ ] Todos los contenedores en estado "healthy"
- [ ] Usuario administrador insertado en la base de datos
- [ ] Login funcional desde el frontend
- [ ] CORS configurado correctamente

---

**Última actualización**: 6 de febrero de 2026
**Versión**: 1.0.0

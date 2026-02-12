# 🚀 Carmina Burana ERP - Quick Start

## Inicio Rápido (5 minutos)

### 1. Configurar Variables de Entorno

Crear archivo `.env` en la raíz:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres -> Ajustenlo a su configuracion en .env
POSTGRES_DB=dbcarmina
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/dbcarmina

# Backend
SECRET_KEY="HASH"
ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
JWT_ALGORITHM="HS256"
JWT_EXPIRATION_MINUTES=1440

# Frontend
VITE_API_URL=http://localhost:8000
```

### 2. Levantar Contenedores

```bash
docker-compose up -d
```

### 3. Insertar Usuario Administrador

```bash
docker-compose exec db psql -U postgres -d dbcarmina -c "INSERT INTO users (id, username, full_name, password, role, is_active, created_at) VALUES ('0', 'admin', 'admin', '\$argon2id\$v=19\$m=65536,t=3,p=4\$dE5pLeU8h3COEUJIKeVcqw\$bJZCrTseolTNv6cr3uS8LumRgdQPXyt34DiCp5PqWsc', 'admin', true, CURRENT_TIMESTAMP);"
```

### 4. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Credenciales**: 
  - Username: `admin`
  - Password: `admin`

---

## Comandos Esenciales

```bash
# Ver logs
docker-compose logs -f backend

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Reiniciar desde cero
docker-compose down -v
docker-compose up -d
```

---

## Verificación Rápida

```bash
# ¿Contenedores corriendo?
docker-compose ps

# ¿Backend responde?
curl http://localhost:8000/health

# ¿Usuario existe?
docker-compose exec db psql -U postgres -d dbcarmina -c "SELECT username, role FROM users;"

# ¿Login funciona?
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

---

## Problemas Comunes

### ❌ Error 404 en login
**Solución**: Verificar que `VITE_API_URL=http://localhost:8000` en `.env`

### ❌ Error CORS
**Solución**: Verificar que `ALLOWED_ORIGINS` incluya `http://localhost:3000`

### ❌ Usuario no existe
**Solución**: Ejecutar el INSERT del paso 3

### ❌ Cambios en .env no se aplican
**Solución**: 
```bash
docker-compose down
docker-compose up -d
```

---

Para más detalles, ver **[SETUP.md](./SETUP.md)**

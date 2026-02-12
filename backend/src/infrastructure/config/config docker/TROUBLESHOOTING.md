# 🔧 Carmina Burana ERP - Troubleshooting Guide

## Problemas Resueltos Durante el Desarrollo

Este documento detalla los problemas encontrados durante la configuración inicial del sistema y sus soluciones.

---

## 1. ❌ Error 404 - Endpoint de Login No Encontrado

### Síntoma
```javascript
// Frontend intentaba hacer fetch pero recibía 404
fetch("http://localhost:8000/auth/login") // 404 Not Found
```

### Causa Raíz
Variable de entorno incorrecta en el frontend. El código usaba `VITE_API_BASE_URL` pero Docker Compose definía `VITE_API_URL`.

### Archivos Afectados
- `frontend/src/lib/api/publicClient.js`
- `frontend/src/lib/api/privateClient.js`

### Solución Aplicada

**Antes:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // undefined
```

**Después:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL; // http://localhost:8000
```

### Verificación
```bash
# El frontend ahora se conecta correctamente
curl http://localhost:8000/auth/login # Responde correctamente
```

---

## 2. ❌ Error en Interceptores de Axios

### Síntoma
```
ReferenceError: apiClient is not defined
```

### Causa Raíz
En `privateClient.js`, el objeto se llamaba `privateClient` pero los interceptores usaban `apiClient`.

### Archivo Afectado
- `frontend/src/lib/api/privateClient.js`

### Solución Aplicada

**Antes:**
```javascript
const privateClient = axios.create({...});

apiClient.interceptors.request.use(...);  // ❌ Error
apiClient.interceptors.response.use(...); // ❌ Error
```

**Después:**
```javascript
const privateClient = axios.create({...});

privateClient.interceptors.request.use(...);  // ✅ Correcto
privateClient.interceptors.response.use(...); // ✅ Correcto
```

---

## 3. ❌ CORS Error - 400 Bad Request en OPTIONS

### Síntoma
```
Access to fetch at 'http://localhost:8000/auth/login' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

### Logs del Backend
```
INFO: 172.19.0.1:36880 - "OPTIONS /auth/login HTTP/1.1" 400 Bad Request
```

### Causa Raíz
El frontend corre en `localhost:3000` (puerto mapeado en Docker), pero `ALLOWED_ORIGINS` solo incluía `localhost:5173`.

### Diagnóstico
```bash
# Verificar orígenes permitidos
docker-compose exec backend printenv ALLOWED_ORIGINS
# Output: http://localhost:5173,http://127.0.0.1:5173
# ❌ Falta localhost:3000
```

### Solución Aplicada

**Archivo `.env`:**
```env
# Antes
ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"

# Después
ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
```

**Aplicar cambios:**
```bash
docker-compose down
docker-compose up -d
```

### Verificación
```bash
# Verificar que el backend tiene los nuevos orígenes
docker-compose exec backend printenv ALLOWED_ORIGINS

# Probar petición OPTIONS
curl -X OPTIONS http://localhost:8000/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v
# ✅ Debería responder 200 OK con headers CORS
```

---

## 4. ❌ Usuario No Existe en Base de Datos

### Síntoma
```
POST /auth/login -> 401 Unauthorized
Error: "Credenciales inválidas"
```

### Diagnóstico
```bash
# Verificar usuarios en la BD
docker-compose exec db psql -U postgres -d dbcarmina -c "SELECT * FROM users;"
# Output: (0 rows) ❌
```

### Causa Raíz
No existe script de seeding automático. La tabla `users` se crea vacía después de las migraciones.

### Solución Temporal Aplicada

Insertar usuario manualmente:
```bash
docker-compose exec db psql -U postgres -d dbcarmina -c "
INSERT INTO users (id, username, full_name, password, role, is_active, created_at) 
VALUES (
  '0', 
  'admin', 
  'admin', 
  '\$argon2id\$v=19\$m=65536,t=3,p=4\$dE5pLeU8h3COEUJIKeVcqw\$bJZCrTseolTNv6cr3uS8LumRgdQPXyt34DiCp5PqWsc', 
  'admin', 
  true, 
  CURRENT_TIMESTAMP
);"
```

**Nota**: El hash corresponde a la contraseña `admin` usando Argon2id.

### Solución Permanente (Implementada)

Se creó un script de seeding en `backend/src/infrastructure/database/seed.py`:

```python
async def seed_admin_user():
    """Crea el usuario administrador inicial si no existe."""
    async with AsyncSessionLocal() as session:
        repository = UserRepository(session)
        password_hasher = PasswordHasher()
        
        existing_user = await repository.find_by_username(settings.ADMIN_USERNAME)
        if existing_user:
            print(f"✅ Usuario administrador '{settings.ADMIN_USERNAME}' ya existe")
            return
        
        hashed_password = password_hasher.hash_password(settings.ADMIN_PASSWORD)
        admin_user = User(
            id=str(uuid.uuid4()),
            username=settings.ADMIN_USERNAME,
            full_name=settings.ADMIN_FULL_NAME,
            hashed_password=hashed_password,
            role="admin",
            is_active=True
        )
        
        await repository.save(admin_user)
        print(f"✅ Usuario administrador '{settings.ADMIN_USERNAME}' creado")
```

**Ejecutar manualmente:**
```bash
docker-compose exec backend python -m src.infrastructure.database.seed
```

### Verificación
```bash
# Test de password
docker-compose exec backend python test_login.py

# Output esperado:
# ✅ User found: admin
# ✅ Password verification SUCCESSFUL!

# Test de login via API
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Output esperado:
# {
#   "access_token": "eyJhbGci...",
#   "token_type": "bearer",
#   "user": {"id": "0", "username": "admin", ...}
# }
```

---

## 5. ❌ Cambios en .env No Se Aplican

### Síntoma
Después de modificar `.env`, los contenedores siguen usando valores antiguos.

### Causa Raíz
`docker-compose restart` no recarga las variables de entorno. Solo reinicia los procesos dentro de los contenedores existentes.

### Solución

**Opción 1: Down y Up (Recomendado)**
```bash
docker-compose down
docker-compose up -d
```

**Opción 2: Recrear Contenedor Específico**
```bash
docker-compose up -d --force-recreate backend
```

**Opción 3: Rebuild (Si hay cambios en Dockerfile)**
```bash
docker-compose up -d --build
```

### Verificación
```bash
# Verificar variables de entorno dentro del contenedor
docker-compose exec backend env | grep ALLOWED_ORIGINS
docker-compose exec backend env | grep VITE_API_URL
```

---

## 6. ⚠️ Migraciones Se Aplican en Cada Reinicio

### Síntoma
```
⏳ Step 3: Checking Alembic migrations...
   Current revision: none
   Head revision: c94bd4fa8b8d
📝 Applying pending migrations...
```

### Causa
Después de `docker-compose down -v`, se eliminan los volúmenes de PostgreSQL, perdiendo el estado de la base de datos.

### Solución

**Para desarrollo (mantener datos):**
```bash
# Detener sin eliminar volúmenes
docker-compose down

# Reiniciar
docker-compose up -d
```

**Para empezar desde cero:**
```bash
# Eliminar todo incluyendo volúmenes
docker-compose down -v

# Levantar y volver a insertar usuario
docker-compose up -d
docker-compose exec db psql -U postgres -d dbcarmina -c "INSERT INTO users..."
```

---

## 7. 🔍 Debugging Tips

### Ver Logs en Tiempo Real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend | grep -E "ERROR|WARNING|POST|OPTIONS"

# Solo errores
docker-compose logs backend 2>&1 | grep ERROR
```

### Inspeccionar Base de Datos
```bash
# Conectarse a psql
docker-compose exec db psql -U postgres -d dbcarmina

# Comandos útiles en psql:
\dt              # Listar tablas
\d users         # Describir tabla users
\l               # Listar bases de datos
\conninfo        # Info de conexión
```

### Verificar Conectividad
```bash
# Backend -> Database
docker-compose exec backend nc -zv db 5432

# Host -> Backend
curl -v http://localhost:8000/health

# Host -> Frontend
curl -v http://localhost:3000
```

### Inspeccionar Contenedores
```bash
# Estado y salud
docker-compose ps

# Recursos utilizados
docker stats

# Entrar al contenedor
docker-compose exec backend bash
docker-compose exec frontend sh
```

---

## 8. 📋 Checklist de Verificación

Cuando algo no funciona, verificar en orden:

- [ ] **Contenedores corriendo**: `docker-compose ps` - todos en estado "Up"
- [ ] **Variables de entorno**: `docker-compose exec backend env | grep -E "DATABASE|ALLOWED|VITE"`
- [ ] **Base de datos accesible**: `docker-compose exec db psql -U postgres -d dbcarmina -c '\conninfo'`
- [ ] **Migraciones aplicadas**: `docker-compose exec backend alembic current`
- [ ] **Usuario existe**: `docker-compose exec db psql -U postgres -d dbcarmina -c "SELECT * FROM users;"`
- [ ] **Backend responde**: `curl http://localhost:8000/health`
- [ ] **CORS configurado**: `docker-compose exec backend printenv ALLOWED_ORIGINS`
- [ ] **Frontend accesible**: `curl http://localhost:3000`

---

## 9. 🚨 Errores Comunes y Soluciones Rápidas

| Error | Solución Rápida |
|-------|----------------|
| `Connection refused` | Verificar que los contenedores estén corriendo |
| `404 Not Found` | Verificar `VITE_API_URL` en `.env` |
| `CORS error` | Agregar origen a `ALLOWED_ORIGINS` |
| `401 Unauthorized` | Verificar que el usuario existe en la BD |
| `500 Internal Server Error` | Ver logs: `docker-compose logs backend` |
| `Database does not exist` | Verificar `POSTGRES_DB` en `.env` |
| `Port already in use` | Cambiar puerto en `docker-compose.yml` o matar proceso |

---

## 10. 📞 Comandos de Emergencia

### Resetear Todo
```bash
# Nuclear option - elimina todo
docker-compose down -v
docker system prune -a --volumes
docker-compose up -d --build
```

### Backup Rápido
```bash
# Backup de la BD
docker-compose exec db pg_dump -U postgres dbcarmina > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup de volúmenes
docker run --rm -v carmina-burana-erp_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

### Restaurar Backup
```bash
# Restaurar BD
docker-compose exec -T db psql -U postgres dbcarmina < backup.sql
```

---

**Última actualización**: 6 de febrero de 2026

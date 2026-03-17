# Plan de implementación: Historial de movimientos (audit_logs centralizado)

**Proyecto:** Carmina Burana ERP
 **Versión:** 3.0
 **Fecha:** 17/12/2025

------

## Descripción general

Implementar un sistema de auditoría **append-only** y **centralizado** creando la tabla `audit_logs` desde cero, migrando los datos existentes de `input_movements` hacia ella, y eliminando `input_movements`. Cualquier entidad del sistema (inputs, productos, recetas, etc.) registrará sus cambios en esta única tabla.

### Por qué una tabla centralizada

| Criterio              | Tabla por entidad           | `audit_logs` centralizado  |
| --------------------- | --------------------------- | -------------------------- |
| Migraciones           | Una por cada entidad        | Una sola                   |
| Repositorios          | Uno por entidad             | Uno único y reutilizable   |
| Casos de uso          | Uno por entidad             | Uno único y reutilizable   |
| Reporte por usuario   | `UNION` de N tablas         | Una sola query             |
| Agregar entidad nueva | Nueva tabla + todo el stack | Solo llamar el caso de uso |

------

## Paso 1 — Migraciones de base de datos con Alembic

Se necesitan **dos migraciones en orden**. Nunca combinar ambas en una sola: si la migración de datos falla, se puede hacer rollback sin perder la tabla nueva.

### Migración A — Crear `audit_logs`

#### 1.A.1 Crear el archivo

```bash
alembic revision -m "create_audit_logs_table"
```

#### 1.A.2 Implementar

```python
# alembic/versions/xxxx_create_audit_logs_table.py
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB


def upgrade() -> None:
    op.create_table(
        "audit_logs",
        sa.Column("id",          sa.BigInteger(),  primary_key=True, autoincrement=True),
        sa.Column("user_id",     sa.Integer(),     nullable=True),
        sa.Column("entity_type", sa.String(255),   nullable=False),
        sa.Column("entity_id",   sa.Integer(),     nullable=False),
        sa.Column("action",      sa.String(20),    nullable=False),
        sa.Column("old_data",    JSONB,            nullable=True),
        sa.Column("new_data",    JSONB,            nullable=True),
        sa.Column("created_at",  sa.TIMESTAMP(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
    )

    op.create_check_constraint(
        "ck_audit_logs_action",
        "audit_logs",
        "action IN ('CREATED', 'UPDATED')",
    )

    op.create_index("ix_audit_logs_entity", "audit_logs", ["entity_type", "entity_id"])
    op.create_index("ix_audit_logs_user_id",    "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])


def downgrade() -> None:
    op.drop_table("audit_logs")
```

------

### Migración B — Migrar datos de `input_movements` → `audit_logs` y dropear tabla vieja

> Esta migración asume que `input_movements` tiene al menos las columnas: `id`, `input_id`, `event_type`, `snapshot` (JSONB con `before`/`after`), `occurred_at`, `performed_by`. Ajustar los nombres de columna si difieren en tu tabla real.

#### 1.B.1 Crear el archivo

```bash
alembic revision -m "migrate_input_movements_to_audit_logs"
```

#### 1.B.2 Implementar

```python
# alembic/versions/yyyy_migrate_input_movements_to_audit_logs.py
from alembic import op
from sqlalchemy import text


def upgrade() -> None:
    conn = op.get_bind()

    # Insertar registros de input_movements en audit_logs
    conn.execute(text("""
        INSERT INTO audit_logs (
            user_id,
            entity_type,
            entity_id,
            action,
            old_data,
            new_data,
            created_at
        )
        SELECT
            performed_by          AS user_id,
            'input'               AS entity_type,
            input_id              AS entity_id,
            event_type            AS action,
            snapshot -> 'before'  AS old_data,
            snapshot -> 'after'   AS new_data,
            occurred_at           AS created_at
        FROM input_movements
        ORDER BY occurred_at ASC
    """))

    # Verificar que todos los registros fueron migrados
    original_count = conn.execute(
        text("SELECT COUNT(*) FROM input_movements")
    ).scalar()

    migrated_count = conn.execute(
        text("SELECT COUNT(*) FROM audit_logs WHERE entity_type = 'input'")
    ).scalar()

    if original_count != migrated_count:
        raise Exception(
            f"Migración incompleta: {original_count} registros en input_movements, "
            f"pero solo {migrated_count} migrados a audit_logs."
        )

    # Eliminar tabla vieja solo si la verificación pasó
    op.drop_table("input_movements")


def downgrade() -> None:
    # Recrear input_movements y restaurar datos desde audit_logs
    # Nota: el id original no se preserva, se reasigna
    conn = op.get_bind()

    op.create_table(
        "input_movements",
        # Ajustar columnas según la definición original de tu tabla
    )

    conn.execute(text("""
        INSERT INTO input_movements (
            input_id,
            event_type,
            snapshot,
            occurred_at,
            performed_by
        )
        SELECT
            entity_id                                       AS input_id,
            action                                          AS event_type,
            jsonb_build_object('before', old_data,
                               'after',  new_data)          AS snapshot,
            created_at                                      AS occurred_at,
            user_id                                         AS performed_by
        FROM audit_logs
        WHERE entity_type = 'input'
        ORDER BY created_at ASC
    """))

    conn.execute(text(
        "DELETE FROM audit_logs WHERE entity_type = 'input'"
    ))
```

#### 1.B.3 Aplicar ambas migraciones en orden

```bash
alembic upgrade head
```

#### 1.B.4 Verificar

```bash
alembic current
alembic history --verbose

# Confirmar en la base de datos
# SELECT COUNT(*) FROM audit_logs WHERE entity_type = 'input';
# SELECT * FROM audit_logs LIMIT 5;
```

------

## Paso 2 — Capa de dominio

### 2.1 Crear la entidad `AuditLog`

Reemplaza la entidad anterior `InputMovement` (o `ProductMovement`).

```
domain/
  entities/
    audit_log.py   ← nuevo archivo
# domain/entities/audit_log.py
from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class AuditLog:
    id: int
    entity_type: str    # "input" | "product" | "recipe" | "beer" | ...
    entity_id: int
    action: str         # "CREATED" | "UPDATED"
    old_data: dict | None
    new_data: dict | None
    created_at: datetime
    user_id: int | None = None
```

> `frozen=True` garantiza inmutabilidad a nivel de Python: ninguna capa puede modificar el objeto una vez creado.

### 2.2 Crear el protocolo `IAuditLogRepository`

```python
# domain/repositories/i_audit_log_repository.py
from typing import Protocol, Sequence

from domain.entities.audit_log import AuditLog


class IAuditLogRepository(Protocol):
    def save(self, audit_log: AuditLog) -> AuditLog: ...
    def get_by_entity(self, entity_type: str, entity_id: int) -> Sequence[AuditLog]: ...
    def get_by_user(self, user_id: int) -> Sequence[AuditLog]: ...
    # No existe delete() ni update() — por diseño
```

------

## Paso 3 — Capa de infraestructura

### 3.1 Eliminar el modelo viejo

```bash
# Eliminar el archivo del modelo anterior
rm src/infrastructure/models/input_movement_model.py
```

### 3.2 Crear el modelo SQLAlchemy `AuditLogModel`

```
infrastructure/
  models/
    audit_log_model.py   ← nuevo archivo
# infrastructure/models/audit_log_model.py
from sqlalchemy import BigInteger, Column, Integer, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import JSONB

from infrastructure.database import Base


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id          = Column(BigInteger,  primary_key=True, autoincrement=True)
    user_id     = Column(Integer,     nullable=True)
    entity_type = Column(String(255), nullable=False)
    entity_id   = Column(Integer,     nullable=False)
    action      = Column(String(20),  nullable=False)
    old_data    = Column(JSONB,       nullable=True)
    new_data    = Column(JSONB,       nullable=True)
    created_at  = Column(TIMESTAMP(timezone=True), nullable=False)
```

### 3.3 Eliminar el repositorio viejo y crear `AuditLogRepository`

```bash
rm src/infrastructure/repositories/movement_repository.py
infrastructure/
  repositories/
    audit_log_repository.py   ← nuevo archivo
# infrastructure/repositories/audit_log_repository.py
from datetime import datetime
from typing import Sequence

from sqlalchemy.orm import Session

from domain.entities.audit_log import AuditLog
from infrastructure.models.audit_log_model import AuditLogModel


class AuditLogRepository:
    def __init__(self, session: Session):
        self._session = session

    def save(self, audit_log: AuditLog) -> AuditLog:
        db_model = AuditLogModel(
            user_id=audit_log.user_id,
            entity_type=audit_log.entity_type,
            entity_id=audit_log.entity_id,
            action=audit_log.action,
            old_data=audit_log.old_data,
            new_data=audit_log.new_data,
            created_at=audit_log.created_at,
        )
        self._session.add(db_model)
        self._session.flush()
        return AuditLog(
            id=db_model.id,
            user_id=audit_log.user_id,
            entity_type=audit_log.entity_type,
            entity_id=audit_log.entity_id,
            action=audit_log.action,
            old_data=audit_log.old_data,
            new_data=audit_log.new_data,
            created_at=audit_log.created_at,
        )

    def get_by_entity(self, entity_type: str, entity_id: int) -> Sequence[AuditLog]:
        rows = (
            self._session
            .query(AuditLogModel)
            .filter(
                AuditLogModel.entity_type == entity_type,
                AuditLogModel.entity_id   == entity_id,
            )
            .order_by(AuditLogModel.created_at.desc())
            .all()
        )
        return [self._to_domain(row) for row in rows]

    def get_by_user(self, user_id: int) -> Sequence[AuditLog]:
        rows = (
            self._session
            .query(AuditLogModel)
            .filter(AuditLogModel.user_id == user_id)
            .order_by(AuditLogModel.created_at.desc())
            .all()
        )
        return [self._to_domain(row) for row in rows]

    def _to_domain(self, model: AuditLogModel) -> AuditLog:
        return AuditLog(
            id=model.id,
            user_id=model.user_id,
            entity_type=model.entity_type,
            entity_id=model.entity_id,
            action=model.action,
            old_data=model.old_data,
            new_data=model.new_data,
            created_at=model.created_at,
        )

    # No existe delete() ni update() — por diseño
```

------

## Paso 4 — Capa de aplicación

### 4.1 Eliminar casos de uso viejos

```bash
rm src/application/use_cases/record_input_movement.py
# o el nombre que tenga en tu proyecto
```

### 4.2 Crear `RecordAuditLogUseCase`

Único caso de uso de escritura. Sirve para **cualquier entidad** del sistema.

```python
# application/use_cases/record_audit_log.py
from datetime import datetime, timezone

from domain.entities.audit_log import AuditLog
from domain.repositories.i_audit_log_repository import IAuditLogRepository

VALID_ACTIONS = {"CREATED", "UPDATED"}


class RecordAuditLogUseCase:
    def __init__(self, audit_log_repo: IAuditLogRepository):
        self._audit_log_repo = audit_log_repo

    def execute(
        self,
        entity_type: str,
        entity_id: int,
        action: str,
        new_data: dict,
        old_data: dict | None = None,
        user_id: int | None = None,
    ) -> AuditLog:
        if action not in VALID_ACTIONS:
            raise ValueError(
                f"Acción inválida: '{action}'. Valores permitidos: {VALID_ACTIONS}"
            )

        audit_log = AuditLog(
            id=0,  # asignado por la BD al hacer flush
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            old_data=old_data,
            new_data=new_data,
            created_at=datetime.now(tz=timezone.utc),
            user_id=user_id,
        )
        return self._audit_log_repo.save(audit_log)
```

### 4.3 Crear `GetEntityAuditLogsUseCase`

```python
# application/use_cases/get_entity_audit_logs.py
from typing import Sequence

from domain.entities.audit_log import AuditLog
from domain.repositories.i_audit_log_repository import IAuditLogRepository


class GetEntityAuditLogsUseCase:
    def __init__(self, audit_log_repo: IAuditLogRepository):
        self._audit_log_repo = audit_log_repo

    def execute(self, entity_type: str, entity_id: int) -> Sequence[AuditLog]:
        return self._audit_log_repo.get_by_entity(entity_type, entity_id)
```

### 4.4 Crear `GetUserAuditLogsUseCase`

```python
# application/use_cases/get_user_audit_logs.py
from typing import Sequence

from domain.entities.audit_log import AuditLog
from domain.repositories.i_audit_log_repository import IAuditLogRepository


class GetUserAuditLogsUseCase:
    def __init__(self, audit_log_repo: IAuditLogRepository):
        self._audit_log_repo = audit_log_repo

    def execute(self, user_id: int) -> Sequence[AuditLog]:
        return self._audit_log_repo.get_by_user(user_id)
```

### 4.5 Integrar en casos de uso de entidades

El patrón es siempre el mismo. Aplica a `CreateInputUseCase`, `UpdateInputUseCase`, `CreateProductUseCase`, `UpdateProductUseCase`, y cualquier entidad futura.

```python
# Ejemplo: UpdateInputUseCase.execute()
def execute(self, input_id: int, data: dict, user_id: int | None = None):
    existing = self._input_repo.get_by_id(input_id)
    before_snapshot = {
        "name": existing.name,
        "brand": existing.brand,
        "category": existing.category,
        # ... campos relevantes (excluir _sa_instance_state y campos técnicos)
    }

    updated = self._input_repo.update(input_id, data)

    # Registro centralizado — misma transacción
    self._record_audit_log_use_case.execute(
        entity_type="input",
        entity_id=input_id,
        action="UPDATED",
        old_data=before_snapshot,
        new_data=data,
        user_id=user_id,
    )

    return updated


# Ejemplo: CreateInputUseCase.execute()
def execute(self, data: dict, user_id: int | None = None):
    created = self._input_repo.create(data)

    self._record_audit_log_use_case.execute(
        entity_type="input",
        entity_id=created.id,
        action="CREATED",
        old_data=None,  # no hay estado anterior en creación
        new_data=data,
        user_id=user_id,
    )

    return created
```

### 4.6 Actualizar inyección de dependencias

```python
# presentation/dependencies/audit_log_deps.py
from fastapi import Depends
from sqlalchemy.orm import Session

from application.use_cases.get_entity_audit_logs import GetEntityAuditLogsUseCase
from application.use_cases.get_user_audit_logs import GetUserAuditLogsUseCase
from application.use_cases.record_audit_log import RecordAuditLogUseCase
from infrastructure.database.deps import get_db
from infrastructure.repositories.audit_log_repository import AuditLogRepository


def get_audit_log_repo(db: Session = Depends(get_db)) -> AuditLogRepository:
    return AuditLogRepository(db)

def get_record_audit_log_use_case(
    repo: AuditLogRepository = Depends(get_audit_log_repo),
) -> RecordAuditLogUseCase:
    return RecordAuditLogUseCase(repo)

def get_entity_audit_logs_use_case(
    repo: AuditLogRepository = Depends(get_audit_log_repo),
) -> GetEntityAuditLogsUseCase:
    return GetEntityAuditLogsUseCase(repo)

def get_user_audit_logs_use_case(
    repo: AuditLogRepository = Depends(get_audit_log_repo),
) -> GetUserAuditLogsUseCase:
    return GetUserAuditLogsUseCase(repo)
# presentation/dependencies/input_deps.py — actualizar deps existentes
def get_update_input_use_case(db: Session = Depends(get_db)):
    input_repo = InputRepository(db)
    audit_log_repo = AuditLogRepository(db)          # misma sesión — misma transacción
    record_audit_use_case = RecordAuditLogUseCase(audit_log_repo)
    return UpdateInputUseCase(input_repo, record_audit_use_case)

def get_create_input_use_case(db: Session = Depends(get_db)):
    input_repo = InputRepository(db)
    audit_log_repo = AuditLogRepository(db)
    record_audit_use_case = RecordAuditLogUseCase(audit_log_repo)
    return CreateInputUseCase(input_repo, record_audit_use_case)
```

> La clave es pasar la **misma sesión `db`** a ambos repositorios. Si el guardado del input falla, el audit log hace rollback automáticamente, y viceversa.

------

## Paso 5 — Capa de presentación

### 5.1 Eliminar routers viejos

```bash
rm src/presentation/routers/input_movements_router.py
# o el nombre que tenga en tu proyecto
```

### 5.2 Crear el schema Pydantic `AuditLogResponse`

```python
# presentation/schemas/audit_log_schemas.py
from datetime import datetime

from pydantic import BaseModel

from domain.entities.audit_log import AuditLog


class AuditLogResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    action: str
    old_data: dict | None
    new_data: dict | None
    created_at: datetime
    user_id: int | None

    @classmethod
    def from_domain(cls, audit_log: AuditLog) -> "AuditLogResponse":
        return cls(
            id=audit_log.id,
            entity_type=audit_log.entity_type,
            entity_id=audit_log.entity_id,
            action=audit_log.action,
            old_data=audit_log.old_data,
            new_data=audit_log.new_data,
            created_at=audit_log.created_at,
            user_id=audit_log.user_id,
        )
```

### 5.3 Crear el router `audit_logs_router`

```python
# presentation/routers/audit_logs_router.py
from fastapi import APIRouter, Depends

from application.use_cases.get_entity_audit_logs import GetEntityAuditLogsUseCase
from application.use_cases.get_user_audit_logs import GetUserAuditLogsUseCase
from presentation.dependencies.audit_log_deps import (
    get_entity_audit_logs_use_case,
    get_user_audit_logs_use_case,
)
from presentation.schemas.audit_log_schemas import AuditLogResponse

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("/{entity_type}/{entity_id}", response_model=list[AuditLogResponse])
def get_entity_audit_logs(
    entity_type: str,
    entity_id: int,
    use_case: GetEntityAuditLogsUseCase = Depends(get_entity_audit_logs_use_case),
):
    logs = use_case.execute(entity_type, entity_id)
    return [AuditLogResponse.from_domain(log) for log in logs]


@router.get("/user/{user_id}", response_model=list[AuditLogResponse])
def get_user_audit_logs(
    user_id: int,
    use_case: GetUserAuditLogsUseCase = Depends(get_user_audit_logs_use_case),
):
    logs = use_case.execute(user_id)
    return [AuditLogResponse.from_domain(log) for log in logs]

# Solo existen GET — no hay DELETE ni PUT en este router
```

### 5.4 Actualizar `main.py`

```python
# main.py — reemplazar el router viejo por el nuevo
from presentation.routers.audit_logs_router import router as audit_logs_router

app.include_router(audit_logs_router)
```

------

## Paso 6 — Frontend

### 6.1 Estructura de archivos

```
src/
  services/
    auditLogService.js          ← nuevo (reemplaza inputMovementService.js)
  hooks/
    useEntityAuditLogs.js       ← nuevo (reemplaza useInputMovements.js)
  components/
    shared/
      AuditLogHistory.jsx       ← nuevo, componente reutilizable para cualquier entidad
# Eliminar archivos viejos
rm src/services/inputMovementService.js
rm src/hooks/useInputMovements.js
rm src/components/.../InputMovementHistory.jsx
```

### 6.2 Crear `auditLogService.js`

```js
// services/auditLogService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const auditLogService = {
  async getByEntity(entityType, entityId) {
    const response = await fetch(
      `${API_BASE_URL}/audit-logs/${entityType}/${entityId}`
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  },

  async getByUser(userId) {
    const response = await fetch(`${API_BASE_URL}/audit-logs/user/${userId}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  },
}
```

### 6.3 Crear `useEntityAuditLogs.js`

```js
// hooks/useEntityAuditLogs.js
import { useState, useEffect, useCallback } from "react"
import { auditLogService } from "../services/auditLogService"

export function useEntityAuditLogs(entityType, entityId) {
  const [auditLogs, setAuditLogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAuditLogs = useCallback(async () => {
    if (!entityType || !entityId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await auditLogService.getByEntity(entityType, entityId)
      setAuditLogs(data)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [entityType, entityId])

  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  return { auditLogs, isLoading, error, refetch: fetchAuditLogs }
}
```

### 6.4 Crear `AuditLogHistory.jsx`

Componente reutilizable — sirve para inputs, productos, recetas, o cualquier entidad futura. Solo cambia la prop `entityType`.

```jsx
// components/shared/AuditLogHistory.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEntityAuditLogs } from "../../hooks/useEntityAuditLogs"

export function AuditLogHistory({ entityType, entityId }) {
  const { auditLogs, isLoading, error } = useEntityAuditLogs(entityType, entityId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de cambios</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Cargando historial...</p>
        )}
        {error && (
          <p className="text-sm text-destructive">Error al cargar el historial.</p>
        )}
        {!isLoading && !error && auditLogs.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>
        )}
        {!isLoading && !error && auditLogs.map(log => (
          <div key={log.id} className="border-b py-3 last:border-0">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{log.action}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
            {log.user_id && (
              <p className="text-xs text-muted-foreground">Usuario #{log.user_id}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

### 6.5 Reemplazar uso en páginas existentes

```jsx
// Antes en InputDetailPage.jsx
import { InputMovementHistory } from "../../components/InputMovementHistory"
<InputMovementHistory inputId={inputId} />

// Después
import { AuditLogHistory } from "../../components/shared/AuditLogHistory"
<AuditLogHistory entityType="input" entityId={inputId} />

// Para productos (mismo componente, distinto entityType)
<AuditLogHistory entityType="product" entityId={productId} />
```

------

## Orden de implementación sugerido

| #    | Tarea                                                        | Capa            |
| ---- | ------------------------------------------------------------ | --------------- |
| 1    | Migración A: crear tabla `audit_logs` con constraints e índices | Infraestructura |
| 2    | Migración B: migrar datos de `input_movements` → `audit_logs` y dropear tabla vieja | Infraestructura |
| 3    | Eliminar modelo `InputMovementModel` y crear `AuditLogModel` | Infraestructura |
| 4    | Eliminar `MovementRepository` y crear `AuditLogRepository`   | Infraestructura |
| 5    | Eliminar entidad `InputMovement` y crear entidad `AuditLog` + protocolo `IAuditLogRepository` | Dominio         |
| 6    | Eliminar casos de uso viejos y crear `RecordAuditLogUseCase` | Aplicación      |
| 7    | Crear `GetEntityAuditLogsUseCase` y `GetUserAuditLogsUseCase` | Aplicación      |
| 8    | Crear `audit_log_deps.py` y actualizar `input_deps.py` y `product_deps.py` | Presentación    |
| 9    | Integrar `RecordAuditLogUseCase` en `CreateInputUseCase` y `UpdateInputUseCase` | Aplicación      |
| 10   | Integrar `RecordAuditLogUseCase` en `CreateProductUseCase` y `UpdateProductUseCase` | Aplicación      |
| 11   | Crear schema `AuditLogResponse`                              | Presentación    |
| 12   | Eliminar router viejo y crear `audit_logs_router`            | Presentación    |
| 13   | Actualizar `main.py` con el nuevo router                     | Presentación    |
| 14   | Eliminar `inputMovementService.js` y crear `auditLogService.js` | Frontend        |
| 15   | Eliminar `useInputMovements.js` y crear `useEntityAuditLogs.js` | Frontend        |
| 16   | Eliminar `InputMovementHistory.jsx` y crear `AuditLogHistory.jsx` | Frontend        |
| 17   | Reemplazar uso de `InputMovementHistory` por `AuditLogHistory` en las páginas | Frontend        |

------

## Restricciones de diseño (no negociables)

- La tabla `audit_logs` es **append-only**: no se expone ningún método `delete()` ni `update()` en el repositorio.
- Los endpoints solo aceptan `GET`. No existe `DELETE /audit-logs/{id}` ni `PUT /audit-logs/{id}`.
- La entidad `AuditLog` usa `frozen=True`: es inmutable a nivel de Python.
- El registro del audit log ocurre **dentro de la misma transacción** que el guardado de la entidad. Ambos repositorios reciben la **misma sesión `db`**.
- Las dos migraciones Alembic deben ejecutarse **en orden y por separado**. Nunca combinarlas en una sola.
- El frontend no expone ningún control para editar o eliminar ítems del historial.
- Para agregar auditoría a una nueva entidad: inyectar `RecordAuditLogUseCase` en el `_deps.py` correspondiente. No se crea ningún archivo nuevo de auditoría.
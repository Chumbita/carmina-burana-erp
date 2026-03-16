import React from "react"
import { useEntityAuditLogs } from "../../hooks/useEntityAuditLogs"

export function AuditLogHistory({ entityType, entityId, refreshKey }) {
  const { auditLogs, isLoading, error, refetch } = useEntityAuditLogs(entityType, entityId)

  React.useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando historial...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">Error al cargar el historial.</p>
  }

  if (!auditLogs || auditLogs.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>
  }

  return (
    <div className="space-y-2">
      {auditLogs.map(log => {
        const date = new Date(log.created_at)
        const formattedDate = date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })
        const formattedTime = date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })

        return (
          <div 
            key={log.id} 
            className="text-sm border-l-2 border-border pl-3 py-1"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">
                {log.action === 'CREATED' ? 'Creado' : 'Modificado'}
              </span>
              <span>•</span>
              <span>{formattedDate}</span>
              <span>{formattedTime}</span>
            </div>
            {log.user_id && (
              <div className="text-xs text-muted-foreground mt-1">
                Usuario #{log.user_id}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

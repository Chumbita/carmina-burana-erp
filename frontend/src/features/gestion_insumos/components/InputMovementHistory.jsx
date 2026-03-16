import React from "react"
import { useInputMovements } from "../../../hooks/useInputMovements"

export function InputMovementHistory({ inputId, refreshKey }) {
  const { movements, isLoading, error, refetch } = useInputMovements(inputId)

  React.useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">Error al cargar el historial</p>
  }

  if (!movements || movements.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin movimientos registrados</p>
  }

  return (
    <div className="space-y-2">
      {movements.map(movement => {
        const date = new Date(movement.occurred_at)
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
            key={movement.id} 
            className="text-sm border-l-2 border-border pl-3 py-1"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">
                {movement.event_type === 'CREATED' ? 'Creado' : 'Modificado'}
              </span>
              <span>•</span>
              <span>{formattedDate}</span>
              <span>{formattedTime}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

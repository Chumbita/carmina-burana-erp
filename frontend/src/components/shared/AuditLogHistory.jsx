import React from "react"
import { DataTable } from "@/components/shared/DataTable"
import { Badge } from "@/components/ui/Badge"
import { useEntityAuditLogs } from "../../hooks/useEntityAuditLogs"
import privateClient from "@/lib/api/privateClient"
import { ENDPOINTS } from "@/lib/api/endpoints"

const actionLabels = {
  CREATED: "Creado",
  UPDATED: "Modificado",
}

const actionStyles = {
  CREATED: "bg-green-100 text-green-800",
  UPDATED: "bg-blue-100 text-blue-800",
}

const FIELD_LABELS = {
  name: "Nombre",
  brand_id: "Marca",
  base_uom_id: "UOM",
  min_stock_level: "Stock mínimo",
  supply_category: "Categoría",
  status: "Estado",
}

function label(key) {
  return FIELD_LABELS[key] ?? key
}

function resolveValue(key, value, brandMap, uomMap) {
  if (value == null) return "-"
  if (key === "brand_id" && brandMap[value]) return brandMap[value]
  if (key === "base_uom_id" && uomMap[value]) return uomMap[value]
  return value
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getChangedKeys(oldData, newData, action) {
  if (action === "CREATED" && !oldData) {
    return ["name", "brand_id", "base_uom_id", "min_stock_level"].filter(k => k in (newData || {}))
  }
  if (action === "UPDATED" && oldData && newData) {
    return Object.keys(newData).filter(k => oldData[k] !== newData[k])
  }
  return []
}

export function AuditLogHistory({ entityType, entityId, refreshKey }) {
  const { auditLogs, isLoading, error, refetch } = useEntityAuditLogs(entityType, entityId)
  const [brandMap, setBrandMap] = React.useState({})
  const [uomMap, setUomMap] = React.useState({})

  React.useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  React.useEffect(() => {
    privateClient.get(ENDPOINTS.BRANDS.GET_ALL).then(res => {
      const map = {}
      res.data.forEach(b => { map[b.id] = b.name })
      setBrandMap(map)
    }).catch(() => {})
    privateClient.get(ENDPOINTS.UOMS.GET_OPTIONS).then(res => {
      const map = {}
      res.data.forEach(u => { map[u.id] = u.symbol })
      setUomMap(map)
    }).catch(() => {})
  }, []);

  const columns = React.useMemo(() => [
    {
      accessor: "action",
      header: "Acción",
      render: (value) => (
        <Badge className={actionStyles[value]}>
          {actionLabels[value] ?? value}
        </Badge>
      ),
    },
    {
      accessor: "action",
      header: "Cambios",
      render: (_, row) => {
        const keys = getChangedKeys(row.old_data, row.new_data, row.action)
        if (keys.length === 0) return row.action === "CREATED" ? "Item creado" : "Sin cambios"
        return <div className="space-y-1">{keys.map(k => <div key={k}>{label(k)}</div>)}</div>
      },
    },
    {
      accessor: "old_data",
      header: "Antes",
      render: (value, row) => {
        const keys = getChangedKeys(row.old_data, row.new_data, row.action)
        if (keys.length === 0) return "—"
        return (
          <div className="space-y-1">
            {keys.map(k => (
              <div key={k} className="text-muted-foreground tabular-nums">
                {row.action === "CREATED" ? "—" : resolveValue(k, row.old_data?.[k], brandMap, uomMap)}
              </div>
            ))}
          </div>
        )
      },
    },
    {
      accessor: "new_data",
      header: "Después",
      render: (value, row) => {
        const keys = getChangedKeys(row.old_data, row.new_data, row.action)
        if (keys.length === 0) return "—"
        return (
          <div className="space-y-1">
            {keys.map(k => (
              <div key={k} className="tabular-nums">{resolveValue(k, row.new_data?.[k], brandMap, uomMap)}</div>
            ))}
          </div>
        )
      },
    },
    {
      accessor: "created_at",
      header: "Fecha",
      render: (value) => formatDate(value),
    },
  ], [brandMap, uomMap])

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando historial...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">Error al cargar el historial.</p>
  }

  if (!auditLogs || auditLogs.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin registros de auditoría.</p>
  }

  return <DataTable columns={columns} data={auditLogs} />
}

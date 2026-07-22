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

function formatChanges(oldData, newData, action, brandMap, uomMap) {
  if (action === "CREATED" && !oldData) {
    const keyFields = ["name", "brand_id", "base_uom_id", "min_stock_level"]
    const items = keyFields
      .filter(key => key in (newData || {}))
      .map(key => (
        <div key={key}>
          <span>{label(key)}:</span>{" "}
          {resolveValue(key, newData[key], brandMap, uomMap)}
        </div>
      ))
    return items.length > 0
      ? <div className="space-y-1">{items}</div>
      : "Item creado"
  }

  if (action === "UPDATED" && oldData && newData) {
    const changedKeys = Object.keys(newData).filter(
      key => oldData[key] !== newData[key]
    )
    if (changedKeys.length === 0) return "Sin cambios detectados"
    const items = changedKeys.map(key => {
      const oldVal = resolveValue(key, oldData[key], brandMap, uomMap)
      const newVal = resolveValue(key, newData[key], brandMap, uomMap)
      return (
        <div key={key}>
          <span>{label(key)}:</span>{" "}
          {oldVal} <span className="text-muted-foreground">→</span> {newVal}
        </div>
      )
    })
    return <div className="space-y-1">{items}</div>
  }

  return "-"
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

  const columns = [
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
      accessor: "old_data",
      header: "Cambios",
      render: (value, row) => formatChanges(row.old_data, row.new_data, row.action, brandMap, uomMap),
    },
    {
      accessor: "user_id",
      header: "Usuario",
      render: (value) => value ? `Usuario #${value}` : "Sistema",
    },
    {
      accessor: "created_at",
      header: "Fecha",
      render: (value) => formatDate(value),
    },
  ]

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

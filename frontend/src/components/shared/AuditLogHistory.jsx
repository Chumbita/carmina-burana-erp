import React from "react"
import { DataTable } from "@/components/shared/DataTable"
import { TablePagination } from "@/components/shared/TablePagination"
import { Badge } from "@/components/ui/Badge"
import { useEntityAuditLogs } from "../../hooks/useEntityAuditLogs"
import { brandService } from "@/features/Inventario/brands/services/brandService"
import { uomService } from "@/features/Inventario/gestion_insumos/services/uomService"
import { formatDecimal } from "@/lib/utils/formatters"

const actionLabels = {
  CREATED: "Creado",
  UPDATED: "Modificado",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  DISCARDED: "Descartada",
}

const actionStyles = {
  CREATED: "bg-green-100 text-green-800",
  UPDATED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
  DISCARDED: "bg-slate-100 text-slate-600",
}

const statusLabels = {
  PLANNED: "Planeada",
  DONE: "Completada",
  CANCELLED: "Cancelada",
  DISCARDED: "Descartada",
}

const FIELD_LABELS = {
  name: "Nombre",
  brand_id: "Marca",
  base_uom_id: "UOM",
  min_stock_level: "Stock mínimo",
  supply_category: "Categoría",
  status: "Estado",
  email: "Email",
  phone: "Teléfono",
  address: "Dirección",
  is_active: "Activo",
  quantity: "Cantidad",
  reason: "Motivo",
  delta: "Diferencia",
  lot_code: "Lote",
  lot_id: "Lote",
  previous_quantity: "Cantidad anterior",
  new_quantity: "Cantidad nueva",
  item_name: "Producto",
  bom_version: "Receta (versión)",
  planned_quantity: "Cantidad planificada",
  produced_quantity: "Cantidad producida",
  schedule_date: "Fecha programada",
  description: "Descripción",
}

function label(key) {
  return FIELD_LABELS[key] ?? key
}

const QUANTITY_KEYS = ["planned_quantity", "produced_quantity"]

function resolveValue(key, value, brandMap, uomMap, uomSymbol = null) {
  if (value == null) return "-"
  if (typeof value === "boolean") return value ? "Sí" : "No"
  if (key === "brand_id" && brandMap[value]) return brandMap[value]
  if (key === "base_uom_id" && uomMap[value]) return uomMap[value]
  if (key === "status" && statusLabels[value]) return statusLabels[value]
  if (typeof value === "number") {
    if (QUANTITY_KEYS.includes(key) && uomSymbol) {
      return `${formatDecimal(value)} ${uomSymbol}`
    }
    return formatDecimal(value)
  }
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
    return Object.keys(newData || {}).filter(k => k !== "uom_symbol")
  }
  if (["UPDATED", "COMPLETED", "CANCELLED", "DISCARDED"].includes(action) && oldData && newData) {
    return Object.keys(newData).filter(k => k !== "uom_symbol" && oldData[k] !== newData[k])
  }
  return []
}

export function AuditLogHistory({ entityType, entityId, refreshKey }) {
  const { auditLogs, isLoading, error, page, pageSize, totalItems, totalPages, changePage, refetch } =
    useEntityAuditLogs(entityType, entityId)

  const [brandMap, setBrandMap] = React.useState({})
  const [uomMap, setUomMap] = React.useState({})

  React.useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  React.useEffect(() => {
    brandService.getAll().then((data) => {
      const map = {}
      data.forEach((b) => { map[b.id] = b.name })
      setBrandMap(map)
    }).catch(() => {})
    uomService.getOptions().then((data) => {
      const map = {}
      data.forEach((u) => { map[u.id] = u.symbol })
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
      accessor: "changes",
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
        const uomSymbol = row.new_data?.uom_symbol || row.old_data?.uom_symbol
        const keys = getChangedKeys(row.old_data, row.new_data, row.action)
        if (keys.length === 0) return "—"
        return (
          <div className="space-y-1">
            {keys.map(k => (
              <div key={k} className="text-muted-foreground tabular-nums">
                {row.action === "CREATED" ? "—" : resolveValue(k, row.old_data?.[k], brandMap, uomMap, uomSymbol)}
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
        const uomSymbol = row.new_data?.uom_symbol || row.old_data?.uom_symbol
        const keys = getChangedKeys(row.old_data, row.new_data, row.action)
        if (keys.length === 0) return "—"
        return (
          <div className="space-y-1">
            {keys.map(k => (
              <div key={k} className="tabular-nums">{resolveValue(k, row.new_data?.[k], brandMap, uomMap, uomSymbol)}</div>
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

  if (isLoading && !auditLogs.length) {
    return <p className="text-sm text-muted-foreground">Cargando historial...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">Error al cargar el historial.</p>
  }

  if (!auditLogs.length && !totalItems) {
    return <p className="text-sm text-muted-foreground">Sin registros de auditoría.</p>
  }

  return (
    <div className={isLoading ? "space-y-4 opacity-60" : "space-y-4"}>
      <DataTable columns={columns} data={auditLogs} />

      <TablePagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onChangePage={changePage}
      />
    </div>
  )
}

import { useState, useMemo } from "react"
import { useNavigate, Link } from "react-router-dom"
import { DataTable } from "@/components/shared/DataTable"
import { FilterBar } from "@/components/shared/FilterBar"
import { useLots } from "../hooks/useLots"
import { TablePagination } from "@/components/shared/TablePagination"
import { buildLotsColumns } from "./lotsColumns"

const STATUS_OPTIONS = [
  { label: "Activo", value: "active" },
  { label: "Agotado", value: "depleted" },
  { label: "Vencido", value: "expired" },
  { label: "Todos", value: "all" },
]

export function TabLots({ itemId, base_uom_symbol }) {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState("active")
  const statusParam = useMemo(
    () => statusFilter === "all" ? undefined : statusFilter,
    [statusFilter]
  )
  const { lots, loading, error, page, pageSize, totalItems, totalPages, changePage } =
    useLots(itemId, statusParam)

  const columns = buildLotsColumns(base_uom_symbol)
  const rows = lots.map((lot, i) => ({ ...lot, _index: i + 1 }))

  function handleStatusChange(value) {
    setStatusFilter(value)
    changePage(1)
  }

  function handleRowClick(row) {
    if (row.supply_entry_id) {
      navigate(`/inventario/ingreso-insumos/${row.supply_entry_id}`)
    }
  }

  return (
    <div className="space-y-4">
      <FilterBar
        filters={[
          {
            key: "status",
            placeholder: "Estado",
            value: statusFilter,
            options: STATUS_OPTIONS,
            onChange: handleStatusChange,
          },
        ]}
        hasActiveFilters={statusFilter !== "active"}
        onClearFilters={() => {
          setStatusFilter("active")
          changePage(1)
        }}
      />

      {loading && !lots.length && <p className="text-gray-500 py-4">Cargando lotes...</p>}
      {error && <p className="text-red-500 py-4">Error al cargar lotes</p>}
      {!loading && !error && !lots.length && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-gray-500 mb-2">No hay lotes registrados para este insumo</p>
          <p className="text-sm text-gray-400 mb-4">
            Para registrar un lote, realice un ingreso de insumo
          </p>
          <Link
            to="/inventario/ingreso-insumos"
            className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 cursor-pointer"
          >
            Ir a ingreso de insumos
          </Link>
        </div>
      )}

      {!error && lots.length > 0 && (
        <div className={loading ? "space-y-4 opacity-60" : "space-y-4"}>
          <DataTable
            columns={columns}
            data={rows}
            onRowClick={handleRowClick}
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onChangePage={changePage}
          />
        </div>
      )}
    </div>
  )
}

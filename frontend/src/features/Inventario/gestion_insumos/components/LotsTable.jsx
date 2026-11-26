import { Link } from "react-router-dom"

import { DataTable } from "@/components/shared/DataTable"
import { FilterBar } from "@/components/shared/FilterBar"
import { TablePagination } from "@/components/shared/TablePagination"

/**
 * Presentación pura de la tabla de lotes: filtro por estado, estados de
 * carga/error/vacío y paginación.
 */
export function LotsTable({
  columns,
  rows,
  lots,
  loading,
  error,
  statusFilter,
  statusOptions,
  hasActiveFilter,
  onStatusChange,
  onClearFilters,
  onRowClick,
  page,
  totalPages,
  totalItems,
  pageSize,
  onChangePage,
}) {
  return (
    <div className="space-y-4">
      <FilterBar
        filters={[
          {
            key: "status",
            placeholder: "Estado",
            value: statusFilter,
            options: statusOptions,
            onChange: onStatusChange,
          },
        ]}
        hasActiveFilters={hasActiveFilter}
        onClearFilters={onClearFilters}
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
          <DataTable columns={columns} data={rows} onRowClick={onRowClick} />

          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onChangePage={onChangePage}
          />
        </div>
      )}
    </div>
  )
}

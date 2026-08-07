import { useState, useMemo } from "react"
import { useNavigate, Link } from "react-router-dom"
import { DataTable } from "@/components/shared/DataTable"
import { FilterBar } from "@/components/shared/FilterBar"
import { Badge } from "@/components/ui/Badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { formatDate, formatCurrency } from "@/lib/utils/formatters"
import { useLots } from "../hooks/useLots"

const STATUS_OPTIONS = [
  { label: "Activo", value: "active" },
  { label: "Agotado", value: "depleted" },
  { label: "Vencido", value: "expired" },
  { label: "Todos", value: "all" },
]

const lotStatusStyles = {
  active: "bg-green-100 text-green-800",
  depleted: "bg-gray-100 text-gray-800",
  expired: "bg-red-100 text-red-600",
  expiring_soon: "bg-yellow-100 text-yellow-800",
}

const lotStatusLabels = {
  active: "Activo",
  depleted: "Agotado",
  expired: "Vencido",
  expiring_soon: "Por vencer",
}

export function TabLots({ itemId, base_uom_symbol }) {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState("active")
  const statusParam = useMemo(
    () => statusFilter === "all" ? undefined : statusFilter,
    [statusFilter]
  )
  const { lots, loading, error, page, pageSize, totalItems, totalPages, changePage } =
    useLots(itemId, statusParam)

  const columns = [
    {
      accessor: "index",
      header: "Nro",
      render: (_, row) => row._index,
    },
    {
      accessor: "lot_code",
      header: "Código de lote",
    },
    {
      accessor: "quantity",
      header: "Cantidad",
      render: (value) => (
        <span className="font-medium tabular-nums">
          {Number(value).toLocaleString("es-AR")} {base_uom_symbol}
        </span>
      ),
    },
    {
      accessor: "unit_cost",
      header: "Costo unitario",
      render: (value) => formatCurrency(value),
    },
    {
      accessor: "expiration_date",
      header: "Vencimiento",
      render: (value) => formatDate(value),
    },
    {
      accessor: "status",
      header: "Estado",
      render: (value) => (
        <Badge className={lotStatusStyles[value]}>
          {lotStatusLabels[value] ?? value}
        </Badge>
      ),
    },
  ]

  const rows = lots.map((lot, i) => ({ ...lot, _index: i + 1 }))

  const startItem = totalItems ? (page - 1) * pageSize + 1 : 0
  const endItem = Math.min(page * pageSize, totalItems)

  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5 || page <= 3) return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })

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

      {loading && <p className="text-gray-500 py-4">Cargando lotes...</p>}
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

      {!loading && !error && lots.length > 0 && (
        <>
          <DataTable
            columns={columns}
            data={rows}
            onRowClick={handleRowClick}
          />

          <div className="flex items-center gap-4">
            {totalPages > 1 && (
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => changePage(page - 1)}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {totalPages > 5 && page > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {pageNumbers.map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={page === pageNum}
                        onClick={() => changePage(pageNum)}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {totalPages > 5 && page < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => changePage(page + 1)}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            <p className="text-sm text-gray-600">
              Resultados {startItem}~{endItem} de {totalItems}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

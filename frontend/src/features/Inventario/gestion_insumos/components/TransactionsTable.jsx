import { Link } from "react-router-dom"
import { ExternalLink } from "lucide-react"
import { DataTable } from "@/components/shared/DataTable"
import { useTransactions } from "../hooks/useTransactions"
import { TablePagination } from "@/components/shared/TablePagination"

const REFERENCE_LABELS = {
  supply_entry: "Entrada",
}

const REFERENCE_ROUTES = {
  supply_entry: (id) => `/inventario/ingreso-insumos/${id}`,
}

function localFormatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const quantityClass = "font-medium tabular-nums"

const columns = [
  { header: "Tipo", accessor: "transaction_label" },
  { header: "Lote", accessor: "lot_code" },
  {
    header: "Cantidad",
    accessor: "quantity",
    render: (value, row) => {
      const isPositive = value > 0
      return (
        <span className={`${quantityClass} ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? "+" : ""}
          {Number(value).toFixed(2)} {row.uom_symbol}
        </span>
      )
    },
  },
  {
    header: "Referencia",
    accessor: "reference_type",
    render: (value, row) => {
      const label = REFERENCE_LABELS[value] ?? value
      const toRoute = REFERENCE_ROUTES[value]
      const text = `${label} #${row.reference_id}`
      if (toRoute) {
        return (
          <Link
            to={toRoute(row.reference_id)}
            className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline font-medium"
          >
            {text}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )
      }
      return text
    },
  },
  {
    header: "Fecha",
    accessor: "created_at",
    render: (value) => localFormatDate(value),
  },
]

export function TransactionsTable({ itemId }) {
  const { transactions, loading, error, page, pageSize, totalItems, totalPages, changePage } =
    useTransactions(itemId)

  if (loading && !transactions.length) {
    return <p className="text-sm text-muted-foreground">Cargando movimientos...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">Error al cargar los movimientos.</p>
  }

  if (!transactions || transactions.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>
  }

  return (
    <div className={loading ? "space-y-4 opacity-60" : "space-y-4"}>
      <DataTable columns={columns} data={transactions} />

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
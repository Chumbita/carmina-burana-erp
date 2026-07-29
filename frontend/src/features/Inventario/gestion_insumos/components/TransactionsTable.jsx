import { Link } from "react-router-dom"
import { DataTable } from "@/components/shared/DataTable"
import { useTransactions } from "../hooks/useTransactions"

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
          <Link to={toRoute(row.reference_id)} className="text-primary underline-offset-2 hover:underline font-medium">
            {text}
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
  const { transactions, loading, error } = useTransactions(itemId)

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando movimientos...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">Error al cargar los movimientos.</p>
  }

  if (!transactions || transactions.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>
  }

  return <DataTable columns={columns} data={transactions} />
}
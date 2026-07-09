import { DataTable } from "@/components/shared/DataTable"
import { useTransactions } from "../hooks/useTransactions"

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
    render: (value) => {
      const isPositive = value > 0
      return (
        <span className={`${quantityClass} ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? "+" : ""}
          {Number(value).toFixed(2)}
        </span>
      )
    },
  },
  {
    header: "Referencia",
    accessor: "reference_type",
    render: (value, row) => {
      const label = value === "supply_entry" ? "Entrada" : value
      return `${label} #${row.reference_id}`
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
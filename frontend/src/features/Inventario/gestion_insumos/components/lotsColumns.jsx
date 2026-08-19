import { Badge } from "@/components/ui/Badge"
import { formatDate, formatCurrency } from "@/lib/utils/formatters"

const lotStatusStyles = {
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  depleted: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  expired: "bg-red-500/10 text-red-600 border-red-500/30",
  expiring_soon: "bg-amber-500/10 text-amber-700 border-amber-500/30",
}

const lotStatusLabels = {
  active: "Óptimo",
  depleted: "Agotado",
  expired: "Vencido",
  expiring_soon: "Por vencer",
}

export function buildLotsColumns(baseUomSymbol) {
  return [
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
          {Number(value).toLocaleString("es-AR")} {baseUomSymbol}
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
}

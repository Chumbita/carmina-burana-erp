import { Badge } from "@/components/ui/Badge"
import { formatDate, formatCurrency } from "@/lib/utils/formatters"

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

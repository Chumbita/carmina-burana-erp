import { Badge } from "@/components/ui/Badge"
import { formatCurrency, formatDate, formatDecimal } from "@/lib/utils/formatters"
import { estadoStyles } from "@/features/Inventario/gestion_insumos"

export const lowStockColumns = [
  { header: "Item", accessor: "item_name" },
  {
    header: "Stock",
    accessor: "stock_total",
    render: (value, row) => `${formatDecimal(value)} ${row.uom_symbol}`,
  },
  {
    header: "Estado",
    accessor: "status",
    render: (value) => <Badge className={estadoStyles[value?.toLowerCase()]}>{value}</Badge>,
  },
]

export const expiringLotColumns = [
  { header: "Item", accessor: "item_name" },
  { header: "Lote", accessor: "lot_code" },
  { header: "Vence", accessor: "expiration_date", render: formatDate },
  {
    header: "Cant.",
    accessor: "quantity",
    render: (value, row) => `${formatDecimal(value)} ${row.uom_symbol}`,
  },
]

export const recentEntryColumns = [
  { header: "Doc.", accessor: "document_number", render: (value) => value || "Sin doc." },
  { header: "Proveedor", accessor: "supplier_name", render: (value) => value || "Sin proveedor" },
  { header: "Total", accessor: "total_cost", render: formatCurrency },
]

import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Pencil } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils/formatters"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip"

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

export function buildLotsColumns(baseUomSymbol, onAdjust) {
  const cols = [
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
      render: (value, row) => {
        const isEditable = row.status !== "depleted" && row.status !== "expired"
        const button = onAdjust ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-7 w-7 shrink-0 ${!isEditable ? "opacity-30 cursor-not-allowed" : ""}`}
            aria-label={isEditable ? "Ajustar stock" : "No editable: lote agotado/vencido"}
            disabled={!isEditable}
            onClick={(e) => {
              e.stopPropagation()
              if (!isEditable) return
              onAdjust(row)
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : null

        const content = (
          <span className="inline-flex items-center gap-2 font-medium tabular-nums">
            <span>
              {Number(value).toLocaleString("es-AR")} {baseUomSymbol}
            </span>
            {button}
          </span>
        )

        if (!isEditable && onAdjust) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent side="top">No editable: lote agotado/vencido</TooltipContent>
            </Tooltip>
          )
        }

        return content
      },
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

  return cols
}

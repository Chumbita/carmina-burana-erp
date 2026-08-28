import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { MoreVertical } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils/formatters"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"

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

  if (onAdjust) {
    cols.push({
      accessor: "actions",
      header: "",
      render: (_, row) => {
        const isEditable = row.status !== "depleted" && row.status !== "expired"
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Acciones"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {isEditable ? (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAdjust(row)
                  }}
                >
                  Ajuste de stock
                </DropdownMenuItem>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block w-full">
                      <DropdownMenuItem disabled className="opacity-50">
                        Ajuste de stock
                      </DropdownMenuItem>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">No editable: lote agotado/vencido</TooltipContent>
                </Tooltip>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    })
  }

  return cols
}

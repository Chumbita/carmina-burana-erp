import { Link } from "react-router-dom"
import { ExternalLink, Info } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip"
import { formatDecimal } from "@/lib/utils/formatters"

import { resolveTransactionReference } from "../dto/transaction.dto"

const quantityClass = "font-medium tabular-nums"

function formatTransactionDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export const transactionColumns = [
  {
    header: "Tipo",
    accessor: "transaction_label",
    render: (value, row) =>
      row.reason ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 underline decoration-dotted cursor-help">
              {value}
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="font-medium">Motivo:</p>
            <p>{row.reason}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        value
      ),
  },
  { header: "Lote", accessor: "lot_code" },
  {
    header: "Cantidad",
    accessor: "quantity",
    render: (value, row) => {
      const isPositive = value > 0
      return (
        <span className={`${quantityClass} ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? "+" : ""}
          {formatDecimal(value)} {row.uom_symbol}
        </span>
      )
    },
  },
  {
    header: "Referencia",
    accessor: "reference_type",
    render: (value, row) => {
      const reference = resolveTransactionReference(value, row.reference_id)

      if (reference.to) {
        return (
          <Link
            to={reference.to}
            className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline font-medium"
          >
            {reference.text}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )
      }

      return reference.text
    },
  },
  {
    header: "Fecha",
    accessor: "created_at",
    render: (value) => formatTransactionDate(value),
  },
]

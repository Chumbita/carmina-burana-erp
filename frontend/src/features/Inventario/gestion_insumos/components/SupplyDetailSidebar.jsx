import { PackageIcon } from "lucide-react"

import { Badge } from "@/components/ui/Badge"
import { EntityDetailPage } from "@/components/shared/DetailPage/EntityDetailPage"
import { formatDecimal } from "@/lib/utils/formatters"

import { estadoStyles } from "../utils/stockStyles"

/**
 * Panel lateral del detalle de un insumo de producción.
 */
export function SupplyDetailSidebar({ supply }) {
  return (
    <EntityDetailPage.Sidebar
      icon={<PackageIcon className="h-10 w-10 text-gray-400" />}
    >
      <EntityDetailPage.Sidebar.Row label="Tipo" value="Producción" />
      <EntityDetailPage.Sidebar.Row
        label="Stock actual"
        value={`${formatDecimal(supply?.stock_total)} ${supply?.base_uom_symbol ?? ""}`}
      />
      <EntityDetailPage.Sidebar.Row
        label="Estado"
        value={
          <Badge className={`${estadoStyles[supply?.estado_stock]} capitalize`}>
            {supply?.estado_stock}
          </Badge>
        }
      />
    </EntityDetailPage.Sidebar>
  )
}

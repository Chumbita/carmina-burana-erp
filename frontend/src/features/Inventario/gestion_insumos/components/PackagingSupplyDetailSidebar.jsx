import { PackageIcon } from "lucide-react"

import { Badge } from "@/components/ui/Badge"
import { EntityDetailPage } from "@/components/shared/DetailPage/EntityDetailPage"
import { formatDecimal } from "@/lib/utils/formatters"

import { estadoStyles } from "../utils/stockStyles"

/**
 * Panel lateral del detalle de un envase.
 */
export function PackagingSupplyDetailSidebar({ packagingSupply }) {
  return (
    <EntityDetailPage.Sidebar
      icon={<PackageIcon className="h-10 w-10 text-gray-400" />}
    >
      <EntityDetailPage.Sidebar.Row label="Tipo" value="Envase" />
      <EntityDetailPage.Sidebar.Row
        label="Stock actual"
        value={`${formatDecimal(packagingSupply?.stock_total)} ${packagingSupply?.base_uom_symbol ?? ""}`}
      />
      <EntityDetailPage.Sidebar.Row
        label="Unidad"
        value={packagingSupply?.base_uom_symbol ?? "-"}
      />
      <EntityDetailPage.Sidebar.Row
        label="Estado"
        value={
          <Badge className={estadoStyles[packagingSupply?.estado_stock]}>
            {packagingSupply?.estado_stock}
          </Badge>
        }
      />
    </EntityDetailPage.Sidebar>
  )
}

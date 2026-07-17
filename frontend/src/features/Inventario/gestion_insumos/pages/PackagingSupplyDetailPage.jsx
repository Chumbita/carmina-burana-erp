import { PackageIcon } from "lucide-react"
import { Badge } from "@/components/ui/Badge"

import { useParams } from "react-router-dom"
import { usePackagingSupply } from "../hooks/usePackagingSupply"
import { useSupplies } from "../hooks/useSupplies"

import { PackagingSupplyDetailTabs } from "../components/PackagingSupplyDetailTabs"
import { EntityDetailPage } from "@/components/shared/DetailPage/EntityDetailPage"
import { estadoStyles } from "../utils/stockStyles"

export default function PackagingSupplyDetailPage() {
  const { inputId } = useParams()
  const { packagingSupply, loading, error, updatePackagingSupply, deleteSupply } = usePackagingSupply(inputId)
  const { supplies } = useSupplies()

  return (
    <EntityDetailPage loading={loading} error={error}>
      <EntityDetailPage.Header name={packagingSupply?.name} />

      <EntityDetailPage.Sidebar icon={<PackageIcon className="h-10 w-10 text-gray-400" />}>
        <EntityDetailPage.Sidebar.Row label="Tipo" value="Envase" />
        <EntityDetailPage.Sidebar.Row
          label="Stock actual"
          value={`${packagingSupply?.stock_total ?? 0} ${packagingSupply?.base_uom_symbol ?? ""}`}
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

      <EntityDetailPage.Content>
        <PackagingSupplyDetailTabs
          packagingSupply={packagingSupply}
          onPackagingSupplyUpdated={updatePackagingSupply}
          onDeleteSupply={deleteSupply}
          availableInputs={supplies}
        />
      </EntityDetailPage.Content>
      <EntityDetailPage.History entityType="input" entityId={packagingSupply?.id} />
    </EntityDetailPage>
  )
}

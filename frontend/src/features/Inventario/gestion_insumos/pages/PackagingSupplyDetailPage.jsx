import { PackageIcon } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { formatDecimal } from "@/lib/utils/formatters"

import { useParams } from "react-router-dom"
import { usePackagingSupply } from "../hooks/usePackagingSupply"
import { useSupplies } from "../hooks/useSupplies"

import { PackagingSupplyDetailTabs } from "../components/PackagingSupplyDetailTabs"
import { TransactionsTable } from "../components/TransactionsTable"
import { EntityDetailPage } from "@/components/shared/DetailPage/EntityDetailPage"
import { AuditLogHistory } from "@/components/shared/AuditLogHistory"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import { estadoStyles } from "../utils/stockStyles"

export default function PackagingSupplyDetailPage() {
  const { supplyId } = useParams()
  const { packagingSupply, loading, error, updatePackagingSupply, deleteSupply, refetch } = usePackagingSupply(supplyId)
  const { supplies } = useSupplies()

  return (
    <EntityDetailPage loading={loading} error={error}>
      <EntityDetailPage.Header name={packagingSupply?.name} />

      <EntityDetailPage.Sidebar icon={<PackageIcon className="h-10 w-10 text-gray-400" />}>
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

      <EntityDetailPage.Content>
        <PackagingSupplyDetailTabs
          packagingSupply={packagingSupply}
          onPackagingSupplyUpdated={updatePackagingSupply}
          onDeleteSupply={deleteSupply}
          availableSupplies={supplies}
          onStockAdjusted={refetch}
        />
      </EntityDetailPage.Content>
      <EntityDetailPage.History>
        {({ refreshKey }) => (
          <Tabs defaultValue="stock">
            <TabsList variant="line">
              <TabsTrigger value="stock" className="cursor-pointer">Movimientos</TabsTrigger>
              <TabsTrigger value="audit" className="cursor-pointer">Registro de actividad</TabsTrigger>
            </TabsList>
            <TabsContent value="stock">
              <TransactionsTable itemId={packagingSupply?.id} refreshKey={refreshKey} />
            </TabsContent>
            <TabsContent value="audit">
              <AuditLogHistory entityType="supply" entityId={packagingSupply?.id} refreshKey={refreshKey} />
            </TabsContent>
          </Tabs>
        )}
      </EntityDetailPage.History>
    </EntityDetailPage>
  )
}

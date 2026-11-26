import { EntityDetailPage } from "@/components/shared/DetailPage/EntityDetailPage"

import { PackagingSupplyDetailSidebar } from "../components/PackagingSupplyDetailSidebar"
import { PackagingSupplyDetailTabs } from "../components/PackagingSupplyDetailTabs"
import { SupplyHistoryTabs } from "../components/SupplyHistoryTabs"
import { usePackagingSupplyDetailPage } from "../hooks/usePackagingSupplyDetailPage"

/**
 * Detalle de un envase. Solo compone layout.
 */
export default function PackagingSupplyDetailPage() {
  const {
    packagingSupply,
    loading,
    error,
    updatePackagingSupply,
    deleteSupply,
    refetch,
    availableSupplies,
  } = usePackagingSupplyDetailPage()

  return (
    <EntityDetailPage loading={loading} error={error}>
      <EntityDetailPage.Header name={packagingSupply?.name} />

      <PackagingSupplyDetailSidebar packagingSupply={packagingSupply} />

      <EntityDetailPage.Content>
        <PackagingSupplyDetailTabs
          packagingSupply={packagingSupply}
          onPackagingSupplyUpdated={updatePackagingSupply}
          onDeleteSupply={deleteSupply}
          availableSupplies={availableSupplies}
          onStockAdjusted={refetch}
        />
      </EntityDetailPage.Content>

      <EntityDetailPage.History>
        {({ refreshKey }) => (
          <SupplyHistoryTabs
            itemId={packagingSupply?.id}
            refreshKey={refreshKey}
            entityType="supply"
          />
        )}
      </EntityDetailPage.History>
    </EntityDetailPage>
  )
}

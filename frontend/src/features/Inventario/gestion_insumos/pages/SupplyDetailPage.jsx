import { EntityDetailPage } from "@/components/shared/DetailPage/EntityDetailPage"

import { SupplyDetailSidebar } from "../components/SupplyDetailSidebar"
import { SupplyDetailTabs } from "../components/SupplyDetailTabs"
import { SupplyHistoryTabs } from "../components/SupplyHistoryTabs"
import { useSupplyDetailPage } from "../hooks/useSupplyDetailPage"

/**
 * Detalle de un insumo de producción. Solo compone layout.
 */
export default function SupplyDetailPage() {
  const { supply, loading, error, refetch, availableSupplies } = useSupplyDetailPage()

  return (
    <EntityDetailPage loading={loading} error={error}>
      <EntityDetailPage.Header name={supply?.name} />

      <SupplyDetailSidebar supply={supply} />

      <EntityDetailPage.Content>
        <SupplyDetailTabs
          insumo={supply}
          base_uom_symbol={supply?.base_uom_symbol}
          availableSupplies={availableSupplies}
          onStockAdjusted={refetch}
        />
      </EntityDetailPage.Content>

      <EntityDetailPage.History>
        {({ refreshKey }) => (
          <SupplyHistoryTabs itemId={supply?.id} refreshKey={refreshKey} entityType="supply" />
        )}
      </EntityDetailPage.History>
    </EntityDetailPage>
  )
}

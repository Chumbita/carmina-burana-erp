import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs"

import { TabSupply } from "./TabSupply"
import { TabLots } from "./TabLots"
import { useSupplyDetailTabs, SUPPLY_DETAIL_TABS } from "../hooks/useSupplyDetailTabs"

/**
 * Pestañas del panel de detalle de un insumo de producción.
 */
export function SupplyDetailTabs({
  insumo,
  base_uom_symbol,
  availableSupplies = [],
  onStockAdjusted,
}) {
  const { activeTab, setActiveTab } = useSupplyDetailTabs()

  return (
    <div>
      <Tabs defaultValue={SUPPLY_DETAIL_TABS.DETAIL} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value={SUPPLY_DETAIL_TABS.DETAIL} className="cursor-pointer">
            Detalle
          </TabsTrigger>
          <TabsTrigger value={SUPPLY_DETAIL_TABS.LOTS} className="cursor-pointer">
            Lotes
          </TabsTrigger>
        </TabsList>

        <div className="overflow-y-auto min-h-0">
          {activeTab === SUPPLY_DETAIL_TABS.DETAIL && (
            <TabSupply insumo={insumo} availableSupplies={availableSupplies} />
          )}
          {activeTab === SUPPLY_DETAIL_TABS.LOTS && (
            <TabLots
              itemId={insumo?.id}
              base_uom_symbol={base_uom_symbol}
              onStockAdjusted={onStockAdjusted}
            />
          )}
        </div>
      </Tabs>
    </div>
  )
}

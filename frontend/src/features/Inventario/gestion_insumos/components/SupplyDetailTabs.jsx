import { useState } from 'react';
import { TabSupply } from './TabSupply'

import { TabLots } from './TabLots'

//componentes shadcn
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export function SupplyDetailTabs({ insumo, base_uom_symbol, onSupplyUpdated, availableSupplies = [] }) {

  const [contentOption, setContentOption] = useState("insumos");

  return (
    <div>
      <Tabs defaultValue="insumos" onValueChange={setContentOption}>
        <TabsList variant="line">
          <TabsTrigger value="insumos" className="cursor-pointer">Insumos</TabsTrigger>
          <TabsTrigger value="lotes" className="cursor-pointer">Lotes</TabsTrigger>
        </TabsList>

        <div className="overflow-y-auto min-h-0">
          {contentOption === "insumos" && <TabSupply insumo={insumo} onSupplyUpdated={onSupplyUpdated} availableSupplies={availableSupplies} />}
          {contentOption === "lotes" && <TabLots itemId={insumo?.id} base_uom_symbol={base_uom_symbol} />}
        </div>
      </Tabs>
    </div>
  );
}

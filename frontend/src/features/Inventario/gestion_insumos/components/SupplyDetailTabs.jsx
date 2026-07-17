import { useState } from 'react';
import { TabInput } from './TabInput'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export function SupplyDetailTabs({ supply, onSupplyUpdated, availableInputs = [] }) {

  const [contentOption, setContentOption] = useState("detalle");

  return (
    <div>
      <Tabs defaultValue="detalle" onValueChange={setContentOption}>
        <TabsList variant="line">
          <TabsTrigger value="detalle" className="cursor-pointer">Detalle</TabsTrigger>
          <TabsTrigger value="lotes" className="cursor-pointer">Lotes</TabsTrigger>
        </TabsList>

        {contentOption === "detalle" && <TabInput supply={supply} onSupplyUpdated={onSupplyUpdated} />}
        {contentOption === "lotes" && <p>Contenido de Lotes</p>}
      </Tabs>
    </div>
  );
}

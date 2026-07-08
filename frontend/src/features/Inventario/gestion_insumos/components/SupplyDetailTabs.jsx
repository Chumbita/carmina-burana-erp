import { useState } from 'react';
import { TabSupply } from './TabSupply'

import { TabLots } from './TabLots'

//componentes shadcn
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export function SupplyDetailTabs({ insumo, onInputUpdated, availableInputs = [] }) {

  const [contentOption, setContentOption] = useState("insumos");

  return (
    <div>
      <Tabs defaultValue="insumos" onValueChange={setContentOption}>
        <TabsList variant="line">
          <TabsTrigger value="insumos" className="cursor-pointer">Insumos</TabsTrigger>
          <TabsTrigger value="lotes" className="cursor-pointer">Lotes</TabsTrigger>
        </TabsList>

        {contentOption === "insumos" && <TabSupply insumo={insumo} onInputUpdated={onInputUpdated} />}
        {contentOption === "lotes" && <TabLots itemId={insumo?.id} />}
      </Tabs>
    </div>
  );
}

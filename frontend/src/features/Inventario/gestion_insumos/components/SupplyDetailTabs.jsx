import { useState } from 'react';
import { TabSupply } from './TabSupply'

//componentes shadcn
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export function SupplyDetailTabs({ insumo, onSupplyUpdated, availableSupplies = [] }) {

  const [contentOption, setContentOption] = useState("insumos");

  return (
    <div>
      <Tabs defaultValue="insumos" onValueChange={setContentOption}>
        <TabsList variant="line">
          <TabsTrigger value="insumos" className="cursor-pointer">Insumos</TabsTrigger>
          <TabsTrigger value="lotes" className="cursor-pointer">Lotes</TabsTrigger>
        </TabsList>

        {contentOption === "insumos" && <TabSupply insumo={insumo} onSupplyUpdated={onSupplyUpdated} availableSupplies={availableSupplies} />}
        {contentOption === "lotes" && <p>Contenido de Lotes</p>}
      </Tabs>
    </div>
  );
}

import { useState } from 'react';
import { TabInput } from './TabInput'

//componentes shadcn
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export function InputDetailTabs({ insumo, onInputUpdated, availableInputs = [] }) {

  const [contentOption, setContentOption] = useState("insumos");

  return (
    <div>
      <Tabs defaultValue="insumos" onValueChange={setContentOption}>
        <TabsList variant="line">
          <TabsTrigger value="insumos" className="cursor-pointer">Insumos</TabsTrigger>
          <TabsTrigger value="lotes" className="cursor-pointer">Lotes</TabsTrigger>
        </TabsList>

        {contentOption === "insumos" && <TabInput insumo={insumo} onInputUpdated={onInputUpdated} />}
        {contentOption === "lotes" && <p>Contenido de Lotes</p>}
      </Tabs>
    </div>
  );
}

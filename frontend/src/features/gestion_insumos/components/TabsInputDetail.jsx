import { useState } from 'react';
import { TabInput } from './TabInput'

//componentes shadcn
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export function TabsInputDetail({ insumo }) {

  const [contentOption, setContentOption] = useState("insumos");

  return (
    <div>
      <Tabs defaultValue="insumos" onValueChange={setContentOption}>
        <TabsList variant="line">
          <TabsTrigger value="insumos" className="cursor-pointer">Insumos</TabsTrigger>
          <TabsTrigger value="inventario" className="cursor-pointer">Inventario</TabsTrigger>
          <TabsTrigger value="historial" className="cursor-pointer">Historial</TabsTrigger>
        </TabsList>

        {contentOption === "insumos" && <TabInput insumo={insumo} />}
        {contentOption === "inventario" && <p>Lotes</p>}
        {contentOption === "historial" && <p>Historial de movimientos</p>}
      </Tabs>
    </div>
  );
}

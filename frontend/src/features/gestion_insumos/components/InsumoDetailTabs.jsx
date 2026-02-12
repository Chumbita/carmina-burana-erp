import { useState } from 'react';
import { InsumoDetailTable } from './DetalleInsumoTab'

//componentes shadcn
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function TabsDetailInsumo({ insumo }){

 const [contentOption, setContentOption] = useState("insumos");

  return (
    <div>
      <Tabs defaultValue="insumos" onValueChange={setContentOption}>
        <TabsList variant="line">
          <TabsTrigger value="insumos" className="cursor-pointer">Insumos</TabsTrigger>
          <TabsTrigger value="inventario" className="cursor-pointer">Inventario</TabsTrigger>
          <TabsTrigger value="historial" className="cursor-pointer">Historial</TabsTrigger>
        </TabsList>

        {contentOption === "insumos" && <InsumoDetailTable insumo={insumo} />}
        {contentOption === "inventario" && <p>Lotes</p>}
        {contentOption === "historial" && <p>Historial de movimientos</p>}
      </Tabs>
    </div>
  );
}

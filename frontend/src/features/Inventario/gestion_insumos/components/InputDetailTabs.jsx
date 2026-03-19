import { useState } from 'react';
import { TabInput } from './TabInput'
import { InputEntryTab } from './InputEntryTab'

//componentes shadcn
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export function InputDetailTabs({ insumo, onInputUpdated, availableInputs = [] }) {

  const [contentOption, setContentOption] = useState("insumos");

  const handleInputEntrySubmit = async (entryData) => {
    try {
      console.log('Input entry data:', entryData);
      
      if (onInputUpdated) {
        onInputUpdated();
      }
    } catch (error) {
      console.error('Error saving input entry:', error);
      throw error;
    }
  };

  return (
    <div>
      <Tabs defaultValue="insumos" onValueChange={setContentOption}>
        <TabsList variant="line">
          <TabsTrigger value="insumos" className="cursor-pointer">Insumos</TabsTrigger>
          <TabsTrigger value="inventario" className="cursor-pointer">Inventario</TabsTrigger>
          <TabsTrigger value="ingreso" className="cursor-pointer">Ingreso</TabsTrigger>
        </TabsList>

        {contentOption === "insumos" && <TabInput insumo={insumo} onInputUpdated={onInputUpdated} />}
        {contentOption === "inventario" && <p>Lotes</p>}
        {contentOption === "ingreso" && (
          <InputEntryTab 
            availableInputs={availableInputs}
            onSubmit={handleInputEntrySubmit}
          />
        )}
      </Tabs>
    </div>
  );
}

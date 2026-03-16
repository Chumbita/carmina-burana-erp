//componentes shadcn
import { InputDetailTabs } from "../components/InputDetailTabs";
import { Spinner } from "@/components/ui/Spinner";
import { InputMovementHistory } from "../components/InputMovementHistory";

//hooks
import { useParams } from "react-router-dom";
import { useInput } from "../hooks/useInput";
import { useState } from "react";

//Componentes
import { InputDetailHeader } from "../components/InputDetailHeader";
import { InputDetailSidebar } from "../components/InputDetailSidebar";

export default function InputDetailPage() {
  const { inputId } = useParams();
  const {input, loading, error } = useInput(inputId)
  const [refreshKey, setRefreshKey] = useState(0);

  // Función para refrescar el historial cuando se actualiza el insumo
  const handleInputUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Manejar loading
  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!input) return <p>Insumo no encontrado</p>;

  return (
    <div className="grid grid-cols-1 grid-rows-[auto_auto_1fr] lg:grid-cols-[240px_1fr] lg:grid-rows-[auto_1fr] gap-6">
      <InputDetailHeader name={input.name} />
      <InputDetailSidebar input={input} />
      <main className="border rounded-md p-4">
        <InputDetailTabs insumo={input} onInputUpdated={handleInputUpdated}></InputDetailTabs>
      </main>
      <section>
        <h2 className="text-xl font-semibold mb-4">Historial de Movimientos</h2>
        <InputMovementHistory inputId={input.id} refreshKey={refreshKey} />
      </section>
    </div>
  )
}
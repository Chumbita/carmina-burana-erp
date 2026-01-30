import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getInsumoById } from "../services/inputService";
import { Button } from "@/components/ui/Button";

import { 
  ArrowLeft, 

} from 'lucide-react'
import { TabsDetailInsumo } from "../components/InsumoDetailTabs";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";


//manejar estilo de estados provisorio
const estadoStyles = {
  optimo: "bg-green-100 text-green-800",
  bajo: "bg-yellow-100 text-yellow-800",
  critico: "bg-red-100 text-red-800",
}

export default function InsumoDetailPage() {

  const navigate = useNavigate()
  const { insumoId } = useParams();
  const [insumo, setInsumo] = useState(null);
  const [loading, setLoading] = useState(true);

  function handleGuardarInsumo() {
    console.log("Guardar insumo", insumo)
    alert("guardar")
  }
  
  function handleBorrarInsumo() {
    console.log("Guardar insumo", insumo)
    alert("guardar")
  }

  useEffect(() => {
    getInsumoById(insumoId).then((data) => {
      setInsumo(data);
      setLoading(false);
      
    });
  }, [insumoId]);


  if (loading) return <p>Cargando...</p>;
  if (!insumo) return <p>Insumo no encontrado</p>;

    const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 grid-rows-[auto_auto_1fr]
    lg:grid-cols-[240px_1fr] lg:grid-rows-[auto_1fr] gap-6 
    
    ">
      <header className="lg:col-span-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/inventario/insumos")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <h1 className="text-2xl font-semibold tracking-tight">
            {insumo.nombre}
          </h1>
            <Badge className={estadoStyles[insumo.estadoStock]}>
              {insumo.estadoStock}
            </Badge>          
        </div>

        <div className="flex items-center gap-3 ">
          <Button onClick={handleBorrarInsumo}  className="cursor-pointer bg-red-100 text-red-600 hover:bg-red-200">
            Eliminar insumo
          </Button>

        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="bg-white rounded-lg p-4 flex flex-col gap-4">
        <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center -mt-4">
          {insumo.imagen ? (
            <img
              src={insumo.imagen}
              alt={insumo.nombre}
              className="object-cover w-full h-full rounded-md"
            />
          ) : (
            <span className="text-6xl font-semibold text-gray-400">
              {insumo.nombre ? insumo.nombre[0].toUpperCase() : 'I'}
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm ">
          <div className="flex justify-between ">
            <span className="text-gray-500">Stock actual</span>
            <span className="font-medium">{insumo.stockTotal}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Estado</span>
            <span className="font-medium">{insumo.estadoStock}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Actualizado</span>
            <span className="font-medium">hace 2 días</span>
          </div>
        </div>
      </aside>

      {/*MAIN (TABS)*/}
      <main className="border rounded-md p-4">
       <TabsDetailInsumo insumo={insumo}></TabsDetailInsumo>
      </main>
    </div>
  )
}
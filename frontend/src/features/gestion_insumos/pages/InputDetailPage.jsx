import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { inputService } from "../services/inputService";

//componentes shadcn
import { Button } from "@/components/ui/Button";
import { TabsInputDetail } from "../components/TabsInputDetail";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
//iconos
import {
  ArrowLeft,

} from 'lucide-react'



//manejar estilo de estados provisorio
const estadoStyles = {
  optimo: "bg-green-100 text-green-800",
  bajo: "bg-yellow-100 text-yellow-800",
  critico: "bg-red-100 text-red-800",
}

export default function InputDetailPage() {

  const navigate = useNavigate()
  const { insumoId } = useParams();
  const [insumo, setInsumo] = useState(null);
  const [loading, setLoading] = useState(true);

  // OBTENER Y CARGAR INSUMO (por ahora del mock)
  async function loadInsumo() {
    try {
      const data = await inputService.getById(insumoId)
      setInsumo(data)
    } catch (error) {
      console.error("Error al cargar insumo:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInsumo()
  }, [insumoId])


  // Manejar loading
  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!insumo) return <p>Insumo no encontrado</p>;

  return (
    <div className="grid grid-cols-1 grid-rows-[auto_auto_1fr]
    lg:grid-cols-[240px_1fr] lg:grid-rows-[auto_1fr] gap-6">
      {/* HEADER */}
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
            {insumo.name}
          </h1>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="bg-white rounded-lg p-4 flex flex-col gap-4">
        <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center -mt-4">
          {insumo.image ? (
            <img
              src={insumo.image}
              alt={insumo.name}
              className="object-cover w-full h-full rounded-md"
            />
          ) : (
            <span className="text-6xl font-semibold text-gray-400">
              {insumo.name ? insumo.name[0].toUpperCase() : 'I'}
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm ">
          <div className="flex justify-between ">
            <span className="text-gray-500">Stock actual</span>
            <span className="font-medium">{insumo.stock_total} {insumo.unit}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Estado</span>
            <Badge className={estadoStyles[insumo.stock_status]}>
              {insumo.stock_status}
            </Badge>
          </div>

        </div>
      </aside>

      {/*MAIN (TABS)*/}
      <main className="border rounded-md p-4">
        <TabsInputDetail insumo={insumo}></TabsInputDetail>
      </main>
    </div>
  )
}
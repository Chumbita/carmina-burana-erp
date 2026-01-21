import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getInsumoById } from "../services/insumos.service";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Plus, Edit } from "lucide-react";

export default function InsumoDetailPage() {

 const navigate = useNavigate()
  const { insumoId } = useParams();
  const [insumo, setInsumo] = useState(null);
  const [loading, setLoading] = useState(true);

  const ins = (a) => {
    console.log(a)
  } 

  useEffect(() => {
    getInsumoById(insumoId).then((data) => {
      setInsumo(data);
      setLoading(false);
      ins(insumo)
    });
  }, [insumoId]);


  if (loading) return <p>Cargando...</p>;
  if (!insumo) return <p>Insumo no encontrado</p>;

  return (
    <div className="space-y-6">
        {/* Header con título y acciones */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/inventario/insumos')}
                className="hover:bg-neutral-300"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{insumo.nombre}</h1>
             
            </div>
            </div>

            <div className="flex gap-2">
            <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Lote
            </Button>
            <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar Insumo
            </Button>

            </div>
        </div>
    </div>
    )
}
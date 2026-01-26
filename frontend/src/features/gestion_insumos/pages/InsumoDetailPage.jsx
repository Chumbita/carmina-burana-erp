import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getInsumoById } from "../services/insumos.service";
import { Button } from "@/components/ui/Button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle,
  Package,
  Calendar,
  DollarSign,
  TrendingDown,
  MoreVertical
} from 'lucide-react'
import { TabsDetailInsumo } from "../components/InsumoDetailTabs";
import { Link } from "react-router-dom";

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

    const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value)
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
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
                <Link
                  to={`/inventario/insumos/${insumo.id}/lote/nuevo`}
                  className="hover:underline">
                  <Button className="cursor-pointer">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Lote
                  </Button>
                </Link>
                <Button className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Insumo
                </Button>
                
                <Button variant="outline">
                    <Edit className="h-4 w-4" />
                </Button>
            </div>
            </header>

      {/* Alerta de stock bajo */}
      {insumo.stockTotal < insumo.stockMinimo && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Stock por debajo del mínimo</AlertTitle>
          <AlertDescription className="text-yellow-700">
            El stock actual ({insumo.stockTotal} {insumo.unidadMedida}) está por debajo del stock mínimo configurado ({insumo.stockMinimo} {insumo.unidadMedida}).
          </AlertDescription>
        </Alert>
      )}

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-4">
      <Card className="h-35 flex items-center justify-center p-3">
        <img
          src="https://maltosaa.com.mx/wp-content/uploads/bigstock-Beer-Glass-And-Hops-593384301.jpg"
          alt=""
          className="max-h-full max-w-full rounded-xl object-contain"
        />
      </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Stock Total
            </CardDescription>
            <CardTitle className="text-3xl">
              {insumo.stockTotal} <span className="text-lg text-muted-foreground">{insumo.unidadMedida}</span>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Stock Mínimo
            </CardDescription>
            <CardTitle className="text-3xl">
              {insumo.stockMinimo} <span className="text-lg text-muted-foreground">{insumo.unidadMedida}</span>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Costo Promedio
            </CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(insumo.costoPromedio)}
            </CardTitle>
          </CardHeader>
        </Card>
        </div>

        <div>
            <TabsDetailInsumo insumo={insumo} />
        </div>

        </div>


    
    )
}
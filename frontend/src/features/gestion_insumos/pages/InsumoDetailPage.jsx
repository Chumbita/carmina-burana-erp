import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

export default function InsumoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Datos simulados del insumo (después vendrá de la API)
  const insumo = {
    id: id,
    nombre: 'Malta Pilsen',
    tipo: 'Malta',
    marca: 'Patagonia',
    unidadMedida: 'kg',
    stockTotal: 245,
    stockMinimo: 100,
    costoPromedio: 850,
    lotes: [
      {
        id: 'LOTE-001',
        numeroLote: 'MP-2024-089',
        cantidadInicial: 150,
        cantidadDisponible: 120,
        fechaIngreso: '2024-12-15',
        fechaVencimiento: '2025-06-15',
        proveedor: 'Maltería Pampa',
        costoUnitario: 850,
        estado: 'disponible', // disponible, proximo-vencer, vencido, agotado
      },
      {
        id: 'LOTE-002',
        numeroLote: 'MP-2024-102',
        cantidadInicial: 150,
        cantidadDisponible: 125,
        fechaIngreso: '2025-01-10',
        fechaVencimiento: '2025-07-10',
        proveedor: 'Maltería Pampa',
        costoUnitario: 850,
        estado: 'disponible',
      },
      {
        id: 'LOTE-003',
        numeroLote: 'MP-2024-045',
        cantidadInicial: 100,
        cantidadDisponible: 0,
        fechaIngreso: '2024-10-05',
        fechaVencimiento: '2025-04-05',
        proveedor: 'Maltería Pampa',
        costoUnitario: 820,
        estado: 'agotado',
      },
      {
        id: 'LOTE-004',
        numeroLote: 'MP-2023-156',
        cantidadInicial: 80,
        cantidadDisponible: 0,
        fechaIngreso: '2023-11-20',
        fechaVencimiento: '2024-05-20',
        proveedor: 'Distribuidora Norte',
        costoUnitario: 800,
        estado: 'vencido',
      },
    ]
  }

  const lotesActivos = insumo.lotes.filter(l => l.estado === 'disponible' || l.estado === 'proximo-vencer')
  const lotesVencidos = insumo.lotes.filter(l => l.estado === 'vencido')
  const lotesAgotados = insumo.lotes.filter(l => l.estado === 'agotado')

  const getEstadoBadge = (estado) => {
    const badges = {
      'disponible': <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disponible</Badge>,
      'proximo-vencer': <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Próximo a vencer</Badge>,
      'vencido': <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vencido</Badge>,
      'agotado': <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Agotado</Badge>,
    }
    return badges[estado] || null
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header con título y acciones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/inventario/insumos')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{insumo.nombre}</h1>
            <p className="text-muted-foreground">
              {insumo.tipo} • {insumo.marca}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar Insumo
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Lote
          </Button>
        </div>
      </div>

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

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Lotes Activos
            </CardDescription>
            <CardTitle className="text-3xl">
              {lotesActivos.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabla de lotes */}
      <Card>
        <CardHeader>
          <CardTitle>Lotes de Stock</CardTitle>
          <CardDescription>
            Listado completo de lotes con su información detallada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Lote</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Fecha Ingreso</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Costo Unit.</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insumo.lotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay lotes registrados para este insumo
                  </TableCell>
                </TableRow>
              ) : (
                insumo.lotes.map((lote) => (
                  <TableRow 
                    key={lote.id}
                    className={lote.estado === 'vencido' || lote.estado === 'agotado' ? 'opacity-60' : ''}
                  >
                    <TableCell className="font-medium">
                      {lote.numeroLote}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{lote.cantidadDisponible} {insumo.unidadMedida}</span>
                        <span className="text-xs text-muted-foreground">
                          de {lote.cantidadInicial} {insumo.unidadMedida}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(lote.fechaIngreso)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        {lote.estado === 'vencido' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        {lote.estado === 'proximo-vencer' && (
                          <Calendar className="h-4 w-4 text-yellow-500" />
                        )}
                        {formatDate(lote.fechaVencimiento)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {lote.proveedor}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatCurrency(lote.costoUnitario)}
                    </TableCell>
                    <TableCell>
                      {getEstadoBadge(lote.estado)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Lote
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar Lote
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Resumen de lotes */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">Disponibles: {lotesActivos.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                <span className="text-muted-foreground">Agotados: {lotesAgotados.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-muted-foreground">Vencidos: {lotesVencidos.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
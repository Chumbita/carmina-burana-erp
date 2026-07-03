import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'

import { ArrowLeft, Package, Calendar, DollarSign, User, Download, ExternalLink, Trash2, AlertTriangle } from 'lucide-react'

const statusLabels = {
  DRAFT: 'Borrador',
  CONFIRMED: 'Confirmado',
  CANCELED: 'Anulado',
}

const statusVariants = {
  DRAFT: 'secondary',
  CONFIRMED: 'default',
  CANCELED: 'destructive',
}

function formatDate(value, options = {}) {
  if (!value) return '-'
  return new Date(value).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  })
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

/**
 * SupplyEntryDetail - Component for supply entry detail view.
 * @param {Object} props - Component props
 * @param {Object} props.detailHook - Detail hook from useSupplyEntryDetail
 * @param {Function} props.onBack - Callback to go back
 */
export function SupplyEntryDetail({ detailHook, onBack }) {
  const {
    loading,
    error,
    entry,
    showAnnulDialog,
    annulling,
    setShowAnnulDialog,
    handleAnnul,
    handleExport,
    handlePrint,
    handleNavigateToLot,
  } = detailHook

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <div className="p-4">
            <p className="text-sm text-red-600">
              {typeof error === 'string' ? error : error?.message || 'Error al cargar el abastecimiento'}
            </p>
            <Button onClick={onBack} className="mt-4">
              Volver
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const lines = entry.lines || []

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <header className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Detalle de Abastecimiento
              </h1>
              <p className="text-neutral-600 mt-1">
                Código: {entry.document_number || `REC-${entry.id}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={statusVariants[entry.status] || 'secondary'}>
              {statusLabels[entry.status] || entry.status}
            </Badge>

            {entry.status !== 'CANCELED' && (
              <Button variant="outline" size="sm" onClick={() => setShowAnnulDialog(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Anular
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            <Button variant="outline" size="sm" onClick={handlePrint}>
              Imprimir
            </Button>
          </div>
        </header>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Información General
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Fecha de ingreso</p>
                  <p className="text-sm text-neutral-600">
                    {formatDate(entry.entry_date, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Proveedor</p>
                  <p className="text-sm text-neutral-600">{entry.supplier?.name || 'Sin proveedor'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Documento</p>
                  <p className="text-sm text-neutral-600">{entry.document_number}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Costo Total</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {formatMoney(entry.total_cost)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Artículos</p>
                  <p className="text-sm text-neutral-600">
                    {lines.length} artículo{lines.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {entry.description && (
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Descripción</p>
                    <p className="text-sm text-neutral-600">{entry.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Detalle de Insumos Recibidos
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Insumo
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Costo Unitario
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Lote
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {lines.map((line, index) => (
                  <tr key={`${line.item?.id}-${line.lot_id || index}`}>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {line.item?.name || `Insumo #${line.item?.id}`}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {[line.item?.brand_name, line.comment].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-600 text-center">
                      {line.quantity}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-600 text-right">
                      {formatMoney(line.unit_cost)}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-neutral-900 text-right">
                      {formatMoney(line.subtotal)}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-600">
                      {line.lot_code || (line.lot_id ? `#${line.lot_id}` : 'Sin lote')}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-600">
                      {formatDate(line.expiration_date)}
                    </td>
                    <td className="px-4 py-4">
                      {line.lot_id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNavigateToLot(line.lot_id)}
                          className="cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      ) : (
                        <span className="text-xs text-neutral-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <AlertDialog open={showAnnulDialog} onOpenChange={setShowAnnulDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Anular abastecimiento
            </AlertDialogTitle>
            <AlertDialogDescription>
              La anulación todavía no está conectada al backend nuevo.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={annulling}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={annulling}
              onClick={handleAnnul}
              className="bg-red-600 hover:bg-red-700"
            >
              {annulling ? 'Anulando...' : 'Anular'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

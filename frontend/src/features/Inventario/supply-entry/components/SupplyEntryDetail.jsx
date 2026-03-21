import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/AlertDialog'

import { ArrowLeft, Package, Calendar, DollarSign, User, Download, Trash2, AlertTriangle, ExternalLink } from 'lucide-react'

/**
 * SupplyEntryDetail - Component for supply entry detail view
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
    canAnnul,
    isAnnulmentValid,
    registerAnnulment,
    handleAnnulmentSubmit,
    setShowAnnulDialog,
    handleAnnul,
    handleExport,
    handlePrint,
    handleNavigateToBatch,
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Detalle de Abastecimiento
            </h1>
            <p className="text-neutral-600 mt-1">
              ID: {entry.reception_number || `REC-${entry.id}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={entry.status === 'active' ? 'default' : 'secondary'}
            className={entry.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}>
            {entry.status === 'active' ? 'Activa' : entry.status === 'cancelled' ? 'Anulada' : 'Desconocido'}
          </Badge>
          
          {entry.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnnulDialog(true)}
              disabled={!canAnnul}
              className="cursor-pointer"
              title={!canAnnul ? 'No se puede anular: pasaron más de 48hs o hay lotes consumidos' : ''}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Anular
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="cursor-pointer"
          >
            Imprimir
          </Button>
        </div>
      </div>

      {/* Warning */}
      {entry.status === 'active' && !canAnnul && (
        <Card className="border-amber-200 bg-amber-50">
          <div className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-900">Restricciones de Anulación</h3>
              <p className="text-sm text-amber-700 mt-1">
                Esta recepción no puede ser anulada porque han pasado más de 48 horas 
                o algunos de los lotes generados ya han sido consumidos.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* General Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Información General
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Fecha de Recepción</p>
                  <p className="text-sm text-neutral-600">
                    {new Date(entry.entry_date + 'T00:00:00').toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Proveedor</p>
                  <p className="text-sm text-neutral-600">{entry.supplier}</p>
                </div>
              </div>
              
              {entry.invoiceNumber && (
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Número de Factura</p>
                    <p className="text-sm text-neutral-600">{entry.invoiceNumber}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Costo Total</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    ${entry.total_cost?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
              
              {entry.description && (
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Descripción</p>
                    <p className="text-sm text-neutral-600">{entry.description}</p>
                  </div>
                </div>
              )}
              
              {entry.status === 'annulled' && (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Anulada</p>
                    <p className="text-sm text-red-700">
                      {entry.annulmentReason}
                    </p>
                    <p className="text-xs text-red-600">
                      {new Date(entry.annulledAt).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Items Detail */}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Costo Unitario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
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
                {entry.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {item.input_name || `Insumo #${item.id_input}`}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {item.comment}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-600">
                      {item.amount}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-600">
                      ${item.unit_cost?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-neutral-900">
                      ${(item.amount * item.unit_cost).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-600">
                      {item.batch?.id ? `#${item.batch.id}` : 'Sin lote'}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-600">
                      {new Date(item.expire_date + 'T00:00:00').toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {item.batch?.current_amount < item.batch?.initial_amount && (
                          <Badge variant="secondary" className="text-xs">
                            Consumido
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNavigateToBatch(item.batch?.id)}
                          className="cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Annulment Dialog */}
      <AlertDialog open={showAnnulDialog} onOpenChange={setShowAnnulDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Anular Recepción
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará los lotes generados, revertirá el stock 
              y cambiará el estado a "Anulada". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={handleAnnulmentSubmit(handleAnnul)}>
            <div className="py-4">
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Motivo de anulación <span className="text-red-500">*</span>
              </label>
              <textarea
                className="flex h-20 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Especifique el motivo por el cual se anula esta recepción..."
                {...registerAnnulment('reason')}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel
                type="button"
                disabled={annulling}
                className="cursor-pointer"
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                disabled={!isAnnulmentValid || annulling}
                className="bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                {annulling ? 'Anulando...' : 'Anular Recepción'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

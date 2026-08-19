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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'

import {
  ArrowLeft,
  Package,
  Calendar,
  DollarSign,
  User,
  Download,
  Trash2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import { formatCurrency, formatDecimal } from '@/lib/utils/formatters'

const getStatusLabel = (status) => {
  const statusMap = {
    active: 'Activa',
    cancelled: 'Anulada',
  }
  return statusMap[status] || 'Desconocido'
}

const getAnnulmentTooltip = (canAnnul) =>
  canAnnul ? '' : 'No se puede anular: pasaron más de 48hs o hay lotes consumidos'

const formatDateTime = (date) =>
  new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })

const formatDate = (date) =>
  date ? new Date(`${date}T00:00:00`).toLocaleDateString('es-AR') : '-'

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  )
}

function InfoBlock({ label, value, detail, tone = 'default' }) {
  const isDanger = tone === 'danger'

  return (
    <div className="px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={isDanger ? 'mt-1 text-sm font-medium text-red-700' : 'mt-1 text-sm text-neutral-900'}>
        {value}
      </p>
      {detail && <p className="mt-1 text-xs text-neutral-500">{detail}</p>}
    </div>
  )
}

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
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="max-w-4xl p-6">
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

  const totalItems = entry.items.reduce((total, item) => total + Number(item.amount || 0), 0)
  const annulmentBlockedReason = getAnnulmentTooltip(canAnnul)

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-neutral-900">
                {entry.reception_number || `REC-${entry.id}`}
              </h1>
              <Badge
                variant={entry.status === 'active' ? 'default' : 'secondary'}
                className={entry.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
              >
                {getStatusLabel(entry.status)}
              </Badge>
            </div>
            <p className="text-sm text-neutral-500">Ingreso de insumos</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {entry.status === 'active' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={!canAnnul ? 'inline-flex cursor-not-allowed' : 'inline-flex'}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnnulDialog(true)}
                    disabled={!canAnnul}
                    className={canAnnul ? 'cursor-pointer' : 'cursor-not-allowed'}
                  >
                    <Trash2 className="h-4 w-4" />
                    Anular
                  </Button>
                </span>
              </TooltipTrigger>
              {!canAnnul && <TooltipContent>{annulmentBlockedReason}</TooltipContent>}
            </Tooltip>
          )}
          <Button variant="outline" size="sm" onClick={handleExport} className="cursor-pointer">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="cursor-pointer">
            Imprimir
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryItem icon={Calendar} label="Recepción" value={formatDateTime(entry.entry_date)} />
        <SummaryItem icon={User} label="Proveedor" value={entry.supplier} />
        <SummaryItem icon={Package} label="Cantidad recibida" value={`${totalItems} unidades`} />
        <SummaryItem icon={DollarSign} label="Costo total" value={formatMoney(entry.total_cost)} />
      </div>

      {(entry.invoiceNumber || entry.description || entry.status === 'cancelled') && (
        <Card className="gap-0 rounded-lg py-0 shadow-none">
          <div className="grid grid-cols-1 divide-y text-sm md:grid-cols-3 md:divide-x md:divide-y-0">
            {entry.invoiceNumber && <InfoBlock label="N° de factura" value={entry.invoiceNumber} />}
            {entry.description && <InfoBlock label="Descripción" value={entry.description} />}
            {entry.status === 'cancelled' && (
              <InfoBlock
                label="Anulación"
                value={entry.annulmentReason || 'Sin motivo registrado'}
                detail={entry.annulledAt ? formatDateTime(entry.annulledAt) : null}
                tone="danger"
              />
            )}
          </div>
        </Card>
      )}

      <Card className="gap-0 rounded-lg py-0 shadow-none">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold text-neutral-900">Insumos recibidos</h2>
          <span className="text-sm text-neutral-500">{entry.items.length} líneas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead className="border-b bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Insumo
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Cantidad
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Costo Unitario
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Subtotal
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Lote
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Vencimiento
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {entry.items.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {item.supply_name || `Insumo #${item.supply_id}`}
                      </p>
                      <p className="truncate text-xs text-neutral-500">{item.comment}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-neutral-700">{formatDecimal(item.amount)}</td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-neutral-700">
                    {formatMoney(item.unit_cost)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium tabular-nums text-neutral-900">
                    {formatMoney(item.amount * item.unit_cost)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700">
                    {item.batch?.id ? `#${item.batch.id}` : 'Sin lote'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700">{formatDate(item.expire_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
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
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AlertDialog open={showAnnulDialog} onOpenChange={setShowAnnulDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Anular Recepción
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará los lotes generados, revertirá el stock y cambiará el estado a "Anulada".
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={handleAnnulmentSubmit(handleAnnul)}>
            <div className="py-4">
              <label className="mb-2 block text-sm font-medium text-neutral-900">
                Motivo de anulación <span className="text-red-500">*</span>
              </label>
              <textarea
                className="flex h-20 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Especifique el motivo por el cual se anula esta recepción..."
                {...registerAnnulment('reason')}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={annulling} className="cursor-pointer">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                disabled={!isAnnulmentValid || annulling}
                className="cursor-pointer bg-red-600 hover:bg-red-700"
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

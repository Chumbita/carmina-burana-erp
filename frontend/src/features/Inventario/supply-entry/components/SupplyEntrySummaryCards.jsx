import { createElement } from 'react'
import { Calendar, DollarSign, Package, User } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { formatEntryDateTime, formatEntryMoney } from '../utils/supplyEntryFormatters'

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-card-foreground">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {createElement(Icon, { className: 'h-4 w-4' })}
        {label}
      </div>
      <p className="mt-2 truncate text-sm font-semibold">{value}</p>
    </div>
  )
}

function InfoBlock({ label, value, detail, tone = 'default' }) {
  const isDanger = tone === 'danger'

  return (
    <div className="px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={isDanger ? 'mt-1 text-sm font-medium text-destructive' : 'mt-1 text-sm text-foreground'}>
        {value}
      </p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </div>
  )
}

/**
 * Resumen del ingreso: KPIs y datos del comprobante / anulación.
 */
export function SupplyEntrySummaryCards({ entry, totalItems }) {
  const hasDocumentData =
    entry.invoiceNumber || entry.description || entry.status === 'cancelled'

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryItem icon={Calendar} label="Recepción" value={formatEntryDateTime(entry.entry_date)} />
        <SummaryItem icon={User} label="Proveedor" value={entry.supplier} />
        <SummaryItem icon={Package} label="Cantidad recibida" value={`${totalItems} unidades`} />
        <SummaryItem icon={DollarSign} label="Costo total" value={formatEntryMoney(entry.total_cost)} />
      </div>

      {hasDocumentData && (
        <Card className="gap-0 rounded-lg py-0 shadow-none">
          <div className="grid grid-cols-1 divide-y text-sm md:grid-cols-3 md:divide-x md:divide-y-0">
            {entry.invoiceNumber && <InfoBlock label="N° de factura" value={entry.invoiceNumber} />}
            {entry.description && <InfoBlock label="Descripción" value={entry.description} />}
            {entry.status === 'cancelled' && (
              <InfoBlock
                label="Anulación"
                value={entry.annulmentReason || 'Sin motivo registrado'}
                detail={entry.annulledAt ? formatEntryDateTime(entry.annulledAt) : null}
                tone="danger"
              />
            )}
          </div>
        </Card>
      )}
    </>
  )
}

import { ArrowLeft, Download, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { getAnnulmentTooltip, getStatusLabel } from '../utils/supplyEntryFormatters'

/**
 * Cabecera del detalle de un ingreso: identificación, estado y acciones.
 */
export function SupplyEntryDetailHeader({
  entry,
  canAnnul,
  onBack,
  onOpenAnnulDialog,
  onExport,
  onPrint,
}) {
  const annulmentBlockedReason = getAnnulmentTooltip(canAnnul)

  return (
    <header className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 cursor-pointer">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {entry.reception_number || `REC-${entry.id}`}
            </h1>
            <Badge
              variant={entry.status === 'active' ? 'default' : 'secondary'}
              className={entry.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : ''}
            >
              {getStatusLabel(entry.status)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Ingreso de insumos</p>
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
                  onClick={onOpenAnnulDialog}
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
        <Button variant="outline" size="sm" onClick={onExport} className="cursor-pointer">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
        <Button variant="outline" size="sm" onClick={onPrint} className="cursor-pointer">
          Imprimir
        </Button>
      </div>
    </header>
  )
}

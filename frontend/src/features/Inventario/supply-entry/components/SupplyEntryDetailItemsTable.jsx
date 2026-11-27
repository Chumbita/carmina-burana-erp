import { ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatDecimal } from '@/lib/utils/formatters'
import { formatEntryDate, formatEntryMoney } from '../utils/supplyEntryFormatters'

/**
 * Tabla de insumos recibidos en el detalle del ingreso.
 */
export function SupplyEntryDetailItemsTable({ items = [], onNavigateToBatch }) {
  return (
    <Card className="gap-0 rounded-lg py-0 shadow-none">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-base font-semibold text-foreground">Insumos recibidos</h2>
        <span className="text-sm text-muted-foreground">{items.length} líneas</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px]">
          <thead className="border-b bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Insumo
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Cantidad
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Costo Unitario
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Subtotal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Lote
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Vencimiento
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y bg-card">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.supply_name || `Insumo #${item.supply_id}`}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{item.comment}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground">{formatDecimal(item.amount)}</td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground">
                  {formatEntryMoney(item.unit_cost)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium tabular-nums text-foreground">
                  {formatEntryMoney(item.amount * item.unit_cost)}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {item.batch?.id ? `#${item.batch.id}` : 'Sin lote'}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{formatEntryDate(item.expire_date)}</td>
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
                      onClick={() => onNavigateToBatch(item.batch?.id)}
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
  )
}

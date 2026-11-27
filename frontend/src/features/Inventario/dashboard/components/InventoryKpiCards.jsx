import { Card, CardContent } from "@/components/ui/Card"
import { STATUS_COLORS } from "../constants/inventoryDashboard.constants"

function KpiCard({ title, value, color }) {
  return (
    <Card className="rounded-lg py-4">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <span className="size-3 rounded-full" style={{ backgroundColor: color }} />
        </div>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

/**
 * KPIs principales del inventario activo.
 */
export function InventoryKpiCards({ summary }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <KpiCard title="Items activos" value={summary.active} color="#111827" />
      <KpiCard title="Sin stock" value={summary.out_of_stock} color={STATUS_COLORS["Sin stock"]} />
      <KpiCard title="Críticos" value={summary.critical} color={STATUS_COLORS["Crítico"]} />
      <KpiCard title="Bajos" value={summary.low} color={STATUS_COLORS["Bajo"]} />
      <KpiCard title="Óptimos" value={summary.optimal} color={STATUS_COLORS["Óptimo"]} />
    </section>
  )
}

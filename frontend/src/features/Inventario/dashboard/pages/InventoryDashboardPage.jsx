import { RefreshCw } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"

import { CategoryStockChart } from "../components/CategoryStockChart"
import { TableCard } from "../components/DashboardCards"
import { InventoryDashboardShell } from "../components/InventoryDashboardShell"
import { InventoryKpiCards } from "../components/InventoryKpiCards"
import { StockStatusChart } from "../components/StockStatusChart"
import {
  expiringLotColumns,
  lowStockColumns,
  recentEntryColumns,
} from "../components/inventoryDashboardColumns"
import { useInventoryDashboard } from "../hooks/useInventoryDashboard"

const TITLE = "Dashboard de Inventario"

/**
 * Dashboard de inventario: compone KPIs, gráficas y tablas de alertas.
 */
export default function InventoryDashboardPage() {
  const {
    dashboard,
    status,
    hasStockData,
    statusData,
    statusLegend,
    categoryData,
    maxCategoryStock,
    loadDashboard,
  } = useInventoryDashboard()

  if (status === "loading") {
    return <InventoryDashboardShell title={TITLE}>Cargando inventario...</InventoryDashboardShell>
  }

  if (status === "error") {
    return (
      <InventoryDashboardShell title={TITLE}>
        <Card className="rounded-lg">
          <CardContent className="flex items-center justify-between gap-4 py-8">
            <span className="text-sm text-muted-foreground">No se pudo cargar el dashboard.</span>
            <Button size="sm" onClick={loadDashboard}>
              <RefreshCw />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </InventoryDashboardShell>
    )
  }

  return (
    <InventoryDashboardShell title={TITLE}>
      <InventoryKpiCards summary={dashboard.summary} />

      <section className="grid gap-4 xl:grid-cols-2">
        <StockStatusChart
          statusData={statusData}
          statusLegend={statusLegend}
          totalActive={dashboard.summary.active}
          empty={!hasStockData || statusData.length === 0}
        />
        <CategoryStockChart
          categoryData={categoryData}
          maxCategoryStock={maxCategoryStock}
          empty={!hasStockData || categoryData.length === 0}
        />
      </section>

      {!hasStockData && (
        <Card className="rounded-lg">
          <CardContent className="py-8 text-sm text-muted-foreground">
            No hay items activos para mostrar.
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 xl:grid-cols-3">
        <TableCard title="Bajo stock">
          <DataTable columns={lowStockColumns} data={dashboard.top_low_stock} emptyMessage="Sin alertas de stock" />
        </TableCard>
        <TableCard title="Vencimientos">
          <DataTable columns={expiringLotColumns} data={dashboard.expiring_lots} emptyMessage="Sin vencimientos próximos" />
        </TableCard>
        <TableCard title="Ingresos recientes">
          <DataTable columns={recentEntryColumns} data={dashboard.recent_entries} emptyMessage="Sin ingresos recientes" />
        </TableCard>
      </section>
    </InventoryDashboardShell>
  )
}

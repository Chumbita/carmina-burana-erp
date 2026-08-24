import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
import { RefreshCw } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatCurrency, formatDate, formatDecimal } from "@/lib/utils/formatters"
import { estadoStyles } from "@/features/Inventario/gestion_insumos/utils/stockStyles"

import { inventoryDashboardService } from "../services/inventoryDashboardService"

const STATUS_COLORS = {
  "Sin stock": "#DC2626",
  "Crítico": "#F97316",
  "Bajo": "#EAB308",
  "Óptimo": "#16A34A",
}

const categoryColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const chartConfig = {
  count: { label: "Items" },
  stock_total: { label: "Stock" },
}

const emptyDashboard = {
  summary: {
    active: 0,
    out_of_stock: 0,
    critical: 0,
    low: 0,
    optimal: 0,
    packaging: 0,
    production: 0,
  },
  stock_by_status: [],
  stock_by_category: [],
  top_low_stock: [],
  expiring_lots: [],
  recent_entries: [],
}

export default function InventoryDashboardPage() {
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [status, setStatus] = useState("loading")

  const loadDashboard = async () => {
    setStatus("loading")
    try {
      setDashboard(await inventoryDashboardService.get())
      setStatus("ready")
    } catch {
      setStatus("error")
    }
  }

  useEffect(() => {
    let mounted = true

    inventoryDashboardService.get()
      .then((data) => {
        if (!mounted) return
        setDashboard(data)
        setStatus("ready")
      })
      .catch(() => {
        if (mounted) setStatus("error")
      })

    return () => {
      mounted = false
    }
  }, [])

  const hasStockData = dashboard.summary.active > 0
  const statusData = useMemo(
    () => dashboard.stock_by_status.filter((item) => item.count > 0),
    [dashboard.stock_by_status],
  )
  const categoryData = useMemo(
    () =>
      dashboard.stock_by_category
        .filter((item) => Number(item.stock_total) > 0)
        .map((item, index) => ({
          ...item,
          fill: categoryColors[index % categoryColors.length],
        })),
    [dashboard.stock_by_category],
  )

  if (status === "loading") {
    return <DashboardShell title="Dashboard de Inventario">Cargando inventario...</DashboardShell>
  }

  if (status === "error") {
    return (
      <DashboardShell title="Dashboard de Inventario">
        <Card className="rounded-lg">
          <CardContent className="flex items-center justify-between gap-4 py-8">
            <span className="text-sm text-muted-foreground">No se pudo cargar el dashboard.</span>
            <Button size="sm" onClick={loadDashboard}>
              <RefreshCw />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell title="Dashboard de Inventario">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Items activos" value={dashboard.summary.active} color="#111827" />
        <KpiCard title="Sin stock" value={dashboard.summary.out_of_stock} color={STATUS_COLORS["Sin stock"]} />
        <KpiCard title="Críticos" value={dashboard.summary.critical} color={STATUS_COLORS["Crítico"]} />
        <KpiCard title="Bajos" value={dashboard.summary.low} color={STATUS_COLORS["Bajo"]} />
        <KpiCard title="Óptimos" value={dashboard.summary.optimal} color={STATUS_COLORS["Óptimo"]} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Estado de stock" empty={!hasStockData || statusData.length === 0}>
          <ChartContainer config={chartConfig} className="mx-auto h-[260px] min-h-[260px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
              <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={62} outerRadius={96} paddingAngle={2}>
                {statusData.map((item) => (
                  <Cell key={item.status} fill={STATUS_COLORS[item.status]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Items por categoria" empty={!hasStockData || categoryData.length === 0}>
          <ChartContainer config={chartConfig} className="h-[260px] min-h-[260px] w-full">
            <BarChart data={categoryData} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} width={96} />
              <ChartTooltip content={<ChartTooltipContent nameKey="category" />} />
              <Bar dataKey="stock_total" radius={4} barSize={14}>
                {categoryData.map((item) => (
                  <Cell key={item.category} fill={item.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </ChartCard>
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
    </DashboardShell>
  )
}

function DashboardShell({ title, children }) {
  return (
    <div className="space-y-4 overflow-x-hidden">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Lectura operativa desde un endpoint analítico: stock, vencimientos e ingresos recientes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/inventario/insumos">Ver insumos</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/inventario/ingreso-insumos">Registrar ingreso</Link>
          </Button>
        </div>
      </header>
      {children}
    </div>
  )
}

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

function ChartCard({ title, empty, children }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[280px]">
        {empty ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            Sin datos para graficar
          </div>
        ) : children}
      </CardContent>
    </Card>
  )
}

function TableCard({ title, children }) {
  return (
    <Card className="overflow-hidden rounded-lg">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0">{children}</CardContent>
    </Card>
  )
}

const lowStockColumns = [
  { header: "Item", accessor: "item_name" },
  {
    header: "Stock",
    accessor: "stock_total",
    render: (value, row) => `${formatDecimal(value)} ${row.uom_symbol}`,
  },
  {
    header: "Estado",
    accessor: "status",
    render: (value) => <Badge className={estadoStyles[value?.toLowerCase()]}>{value}</Badge>,
  },
]

const expiringLotColumns = [
  { header: "Item", accessor: "item_name" },
  { header: "Lote", accessor: "lot_code" },
  { header: "Vence", accessor: "expiration_date", render: formatDate },
  {
    header: "Cant.",
    accessor: "quantity",
    render: (value, row) => `${formatDecimal(value)} ${row.uom_symbol}`,
  },
]

const recentEntryColumns = [
  { header: "Doc.", accessor: "document_number", render: (value) => value || "Sin doc." },
  { header: "Proveedor", accessor: "supplier_name", render: (value) => value || "Sin proveedor" },
  { header: "Total", accessor: "total_cost", render: formatCurrency },
]

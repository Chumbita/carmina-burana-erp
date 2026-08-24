import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Cell, Label, Pie, PieChart } from "recharts"
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

const STATUS_ORDER = ["Óptimo", "Bajo", "Crítico", "Sin stock"]

const CATEGORY_COLORS = {
  maltas: "#2563EB",
  lupulos: "#059669",
  levaduras: "#7C3AED",
  envases: "#EA580C",
  otros: "#64748B",
}

const CATEGORY_ORDER = ["maltas", "lupulos", "levaduras", "envases", "otros"]

const chartConfig = {
  count: { label: "Items" },
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
  const statusLegend = useMemo(
    () =>
      STATUS_ORDER.map((statusName) => (
        dashboard.stock_by_status.find((item) => item.status === statusName) ?? { status: statusName, count: 0 }
      )),
    [dashboard.stock_by_status],
  )
  const categoryData = useMemo(
    () =>
      dashboard.stock_by_category
        .filter((item) => Number(item.stock_total) > 0)
        .map((item, index) => ({
          ...item,
          categoryKey: normalizeCategory(item.category),
          stockTotal: Number(item.stock_total),
          fill: CATEGORY_COLORS[normalizeCategory(item.category)] ?? CATEGORY_COLORS.otros,
          fallbackOrder: index,
        }))
        .sort((a, b) => {
          const orderA = CATEGORY_ORDER.indexOf(a.categoryKey)
          const orderB = CATEGORY_ORDER.indexOf(b.categoryKey)
          return (orderA === -1 ? 99 + a.fallbackOrder : orderA) - (orderB === -1 ? 99 + b.fallbackOrder : orderB)
        }),
    [dashboard.stock_by_category],
  )
  const maxCategoryStock = useMemo(
    () => Math.max(...categoryData.map((item) => item.stockTotal), 0),
    [categoryData],
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
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
            <ChartContainer config={chartConfig} className="h-[148px] min-h-[148px] w-[148px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={44}
                  outerRadius={74}
                  paddingAngle={1}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null

                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy - 7} className="fill-foreground text-3xl font-semibold">
                            {dashboard.summary.active}
                          </tspan>
                          <tspan x={viewBox.cx} y={viewBox.cy + 18} className="fill-muted-foreground text-xs">
                            items
                          </tspan>
                        </text>
                      )
                    }}
                  />
                  {statusData.map((item) => (
                    <Cell key={item.status} fill={STATUS_COLORS[item.status]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="grid w-full max-w-[170px] gap-2 text-xs">
              {statusLegend.map((item) => (
                <div key={item.status} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.status] }} />
                    {item.status.replace("Óptimo", "Optimo").replace("Crítico", "Critico")}
                  </span>
                  <span className="font-semibold text-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Items por categoria" empty={!hasStockData || categoryData.length === 0}>
          <div className="grid min-h-[220px] content-center gap-[14px]">
            {categoryData.map((item) => (
              <div
                key={item.category}
                className="grid grid-cols-[72px_minmax(0,1fr)_42px] items-center gap-3 text-[13px] sm:grid-cols-[92px_minmax(0,1fr)_48px]"
              >
                <span className="truncate text-muted-foreground">{item.category}</span>
                <div className="h-4 overflow-hidden rounded-sm bg-[#EEF2F7]">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${maxCategoryStock > 0 ? (item.stockTotal / maxCategoryStock) * 100 : 0}%`,
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
                <span className="text-right font-semibold text-foreground">{formatDecimal(item.stockTotal)}</span>
              </div>
            ))}
          </div>
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

function normalizeCategory(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
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

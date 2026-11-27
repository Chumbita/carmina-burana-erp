import { Cell, Label, Pie, PieChart } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CHART_CONFIG, STATUS_COLORS } from "../constants/inventoryDashboard.constants"
import { ChartCard } from "./DashboardCards"

/**
 * Distribución de items por estado de stock (dona + leyenda).
 */
export function StockStatusChart({ statusData, statusLegend, totalActive, empty }) {
  return (
    <ChartCard title="Estado de stock" empty={empty}>
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
        <ChartContainer config={CHART_CONFIG} className="h-[148px] min-h-[148px] w-[148px]">
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
                        {totalActive}
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
  )
}

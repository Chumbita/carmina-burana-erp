import { formatDecimal } from "@/lib/utils/formatters"
import { ChartCard } from "./DashboardCards"

/**
 * Stock total por categoría de insumo.
 */
export function CategoryStockChart({ categoryData, maxCategoryStock, empty }) {
  return (
    <ChartCard title="Items por categoria" empty={empty}>
      <div className="grid min-h-[220px] content-center gap-[14px]">
        {categoryData.map((item) => (
          <div
            key={item.category}
            className="grid grid-cols-[72px_minmax(0,1fr)_42px] items-center gap-3 text-[13px] sm:grid-cols-[92px_minmax(0,1fr)_48px]"
          >
            <span className="truncate text-muted-foreground">{item.category}</span>
            <div className="h-4 overflow-hidden rounded-sm bg-muted">
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
  )
}

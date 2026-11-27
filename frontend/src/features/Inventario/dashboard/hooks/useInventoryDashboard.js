import { useCallback, useEffect, useMemo, useState } from "react"

import { EMPTY_INVENTORY_DASHBOARD } from "../constants/inventoryDashboard.constants"
import {
  buildCategoryData,
  buildStatusData,
  buildStatusLegend,
  getMaxCategoryStock,
} from "../dto/inventoryDashboard.dto"
import { inventoryDashboardService } from "../services/inventoryDashboardService"

/**
 * Estado del dashboard de inventario: carga del endpoint analítico y
 * derivación de los datasets de las gráficas.
 */
export function useInventoryDashboard() {
  const [dashboard, setDashboard] = useState(EMPTY_INVENTORY_DASHBOARD)
  const [status, setStatus] = useState("loading")

  const loadDashboard = useCallback(async () => {
    setStatus("loading")
    try {
      setDashboard(await inventoryDashboardService.get())
      setStatus("ready")
    } catch {
      setStatus("error")
    }
  }, [])

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
  const statusData = useMemo(() => buildStatusData(dashboard.stock_by_status), [dashboard.stock_by_status])
  const statusLegend = useMemo(() => buildStatusLegend(dashboard.stock_by_status), [dashboard.stock_by_status])
  const categoryData = useMemo(() => buildCategoryData(dashboard.stock_by_category), [dashboard.stock_by_category])
  const maxCategoryStock = useMemo(() => getMaxCategoryStock(categoryData), [categoryData])

  return {
    dashboard,
    status,
    hasStockData,
    statusData,
    statusLegend,
    categoryData,
    maxCategoryStock,
    loadDashboard,
  }
}

import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useEntityDetailOptional } from "@/components/shared/DetailPage/EntityDetailContext"
import { useLots } from "./useLots"

export const LOTS_STATUS_OPTIONS = [
  { label: "Óptimo", value: "active" },
  { label: "Agotado", value: "depleted" },
  { label: "Vencido", value: "expired" },
  { label: "Todos", value: "all" },
]

const DEFAULT_STATUS_FILTER = "active"

/**
 * Estado y handlers de la pestaña "Lotes" de un insumo/envase.
 */
export function useLotsTab({ itemId, onStockAdjusted }) {
  const navigate = useNavigate()
  const context = useEntityDetailOptional()
  const handleUpdated = context?.handleUpdated

  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER)
  const [selectedLot, setSelectedLot] = useState(null)
  const [adjustOpen, setAdjustOpen] = useState(false)

  const statusParam = useMemo(
    () => (statusFilter === "all" ? undefined : statusFilter),
    [statusFilter]
  )

  const { lots, loading, error, page, pageSize, totalItems, totalPages, changePage, refresh } =
    useLots(itemId, statusParam)

  const handleAdjust = useCallback((lot) => {
    if (lot.status === "depleted" || lot.status === "expired") return
    setSelectedLot(lot)
    setAdjustOpen(true)
  }, [])

  const handleAdjustSuccess = useCallback(() => {
    refresh()
    if (onStockAdjusted) onStockAdjusted()
    if (handleUpdated) handleUpdated()
  }, [refresh, onStockAdjusted, handleUpdated])

  function handleStatusChange(value) {
    setStatusFilter(value)
    changePage(1)
  }

  function clearStatusFilter() {
    setStatusFilter(DEFAULT_STATUS_FILTER)
    changePage(1)
  }

  function handleRowClick(row) {
    if (row.supply_entry_id) {
      navigate(`/inventario/ingreso-insumos/${row.supply_entry_id}`)
    }
  }

  const rows = useMemo(
    () => lots.map((lot, index) => ({ ...lot, _index: (page - 1) * pageSize + index + 1 })),
    [lots, page, pageSize]
  )

  return {
    lots,
    rows,
    loading,
    error,
    page,
    pageSize,
    totalItems,
    totalPages,
    changePage,
    statusFilter,
    statusOptions: LOTS_STATUS_OPTIONS,
    hasActiveFilter: statusFilter !== DEFAULT_STATUS_FILTER,
    handleStatusChange,
    clearStatusFilter,
    handleRowClick,
    handleAdjust,
    handleAdjustSuccess,
    selectedLot,
    adjustOpen,
    setAdjustOpen,
  }
}

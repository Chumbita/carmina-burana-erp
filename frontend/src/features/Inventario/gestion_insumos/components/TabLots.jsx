import { useMemo } from "react"

import { buildLotsColumns } from "./lotsColumns"
import { LotsTable } from "./LotsTable"
import { AdjustLotModal } from "./AdjustLotModal"
import { useLotsTab } from "../hooks/useLotsTab"

/**
 * Contenedor de la pestaña "Lotes" de un insumo/envase.
 */
export function TabLots({ itemId, base_uom_symbol, onStockAdjusted }) {
  const {
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
    statusOptions,
    hasActiveFilter,
    handleStatusChange,
    clearStatusFilter,
    handleRowClick,
    handleAdjust,
    handleAdjustSuccess,
    selectedLot,
    adjustOpen,
    setAdjustOpen,
  } = useLotsTab({ itemId, onStockAdjusted })

  const columns = useMemo(
    () => buildLotsColumns(base_uom_symbol, handleAdjust),
    [base_uom_symbol, handleAdjust]
  )

  return (
    <div className="space-y-4">
      <LotsTable
        columns={columns}
        rows={rows}
        lots={lots}
        loading={loading}
        error={error}
        statusFilter={statusFilter}
        statusOptions={statusOptions}
        hasActiveFilter={hasActiveFilter}
        onStatusChange={handleStatusChange}
        onClearFilters={clearStatusFilter}
        onRowClick={handleRowClick}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onChangePage={changePage}
      />

      <AdjustLotModal
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        itemId={itemId}
        lot={selectedLot}
        baseUomSymbol={base_uom_symbol}
        onSuccess={handleAdjustSuccess}
      />
    </div>
  )
}

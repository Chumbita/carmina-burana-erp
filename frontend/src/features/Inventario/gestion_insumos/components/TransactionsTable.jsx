import { useEffect } from "react"

import { DataTable } from "@/components/shared/DataTable"
import { TablePagination } from "@/components/shared/TablePagination"

import { useTransactions } from "../hooks/useTransactions"
import { transactionColumns } from "./transactionColumns"

/**
 * Movimientos de stock de un insumo/envase.
 */
export function TransactionsTable({ itemId, refreshKey }) {
  const { transactions, loading, error, page, pageSize, totalItems, totalPages, changePage, refetch } =
    useTransactions(itemId)

  // Sigue patrón AuditLogHistory: refresca movimientos al editar stock sin reload
  useEffect(() => {
    if (refreshKey > 0) refetch()
  }, [refreshKey, refetch])

  if (loading && !transactions.length) {
    return <p className="text-sm text-muted-foreground">Cargando movimientos...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">Error al cargar los movimientos.</p>
  }

  if (!transactions || transactions.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>
  }

  return (
    <div className={loading ? "space-y-4 opacity-60" : "space-y-4"}>
      <DataTable columns={transactionColumns} data={transactions} />

      <TablePagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onChangePage={changePage}
      />
    </div>
  )
}

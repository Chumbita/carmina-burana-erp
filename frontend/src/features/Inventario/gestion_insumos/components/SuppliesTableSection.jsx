import { TablePagination } from "@/components/shared/TablePagination"

import { SuppliesTable } from "./SuppliesTable"

/**
 * Sección de listado: tabla + paginación server-side.
 */
export function SuppliesTableSection({
  tableRef,
  data,
  loading,
  page,
  pageSize,
  totalItems,
  totalPages,
  hasRecords,
  onChangePage,
}) {
  return (
    <>
      <div
        ref={tableRef}
        className={loading ? "opacity-60 pointer-events-none transition-opacity" : ""}
      >
        <SuppliesTable
          insumos={data}
          loading={loading}
          page={page}
          pageSize={pageSize}
          hasRecords={hasRecords}
        />
      </div>

      {totalItems > 0 && (
        <div className="flex justify-center">
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onChangePage={onChangePage}
          />
        </div>
      )}
    </>
  )
}

import { NewProductionModal } from "../components/NewProductionModal"
import { FilterBar } from "@/components/shared/FilterBar"
import { TablePagination } from "@/components/shared/TablePagination"
import { useProductionsIncompletePage } from "../hooks/useProductionsIncompletePage"
import { Button } from "@/components/ui/Button"
import { Plus } from "lucide-react"
import { ProductionTable } from "../components/ProductionTable"

export default function ProductionRegisterPage() {
  const {
    data,
    loading,
    page,
    totalItems,
    totalPages,
    pageSize,
    search,
    sortBy,
    sortOrder,
    setSearch,
    setSortBy,
    setSortOrder,
    changePage,
    openModal,
    setOpenModal,
    handlePlanProduction,
    handleExecuteProduction,
    cancelProduction,
    tableRef,
  } = useProductionsIncompletePage()

  const handleSearchChange = (v) => { setSearch(v); changePage(1); }
  const handleSortByChange = (v) => { setSortBy(v); changePage(1); }
  const handleSortOrderChange = (v) => { setSortOrder(v); changePage(1); }

  const hasActiveFilters = search !== ""
  const hasRecords = hasActiveFilters ? true : totalItems > 0 || (data && data.length > 0)

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          searchPlaceholder="Buscar producto..."
          onSearchChange={handleSearchChange}
          sortFields={[{ key: "schedule_date", label: "Fecha Programada" }]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={handleSortByChange}
          onSortOrderChange={handleSortOrderChange}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => {
            setSortBy("schedule_date")
            setSortOrder("asc")
            setSearch("")
            changePage(1)
          }}
        />

        <Button
          size="sm"
          className="cursor-pointer"
          onClick={() => setOpenModal(true)}
        >
          <Plus />
          Nueva producción
        </Button>
      </header>

      <NewProductionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handlePlanProduction}
      />

      <div ref={tableRef} className={loading ? "opacity-60 pointer-events-none transition-opacity" : ""}>
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <ProductionTable
            productions={data}
            hasRecords={hasRecords}
            onExecute={handleExecuteProduction}
            onCancel={cancelProduction}
            page={page}
            pageSize={pageSize}
          />
        )}
      </div>

      {totalItems > 0 && (
        <div className="flex justify-center">
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onChangePage={changePage}
          />
        </div>
      )}
    </div>
  )
}

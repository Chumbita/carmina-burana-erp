import { BomsTable } from "../components/BomsTable"
import { NewBomModal } from "../components/NewBomModal"
import { useBomPage } from "../hooks/useBomPage"
import { FilterBar } from "@/components/shared/FilterBar"
import { TablePagination } from "@/components/shared/TablePagination"
import { Button } from "@/components/ui/Button"
import { Plus } from "lucide-react"

export default function BomsPage() {
  const {
    data,
    loading,
    error,
    page,
    totalItems,
    totalPages,
    pageSize,
    search,
    setSearch,
    changePage,
    openModal,
    setOpenModal,
    handleCreateBom,
  } = useBomPage()

  const handleSearchChange = (v) => { setSearch(v); changePage(1); }

  const hasActiveFilters = search !== ""
  const hasRecords = hasActiveFilters ? true : totalItems > 0 || (data && data.length > 0)

  if (error) {
    return (
      <div className="text-center text-destructive py-8">
        Error al cargar las fórmulas: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          searchPlaceholder="Buscar por producto..."
          onSearchChange={handleSearchChange}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => {
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
          Nueva fórmula
        </Button>
      </header>

      <div className={loading ? "opacity-60 pointer-events-none transition-opacity" : ""}>
        <BomsTable boms={data} loading={loading} page={page} pageSize={pageSize} hasRecords={hasRecords} />
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

      <NewBomModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateBom}
      />
    </div>
  )
}

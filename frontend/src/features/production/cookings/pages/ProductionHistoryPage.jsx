import { FilterBar } from "@/components/shared/FilterBar"
import { TablePagination } from "@/components/shared/TablePagination"
import { useProductionHistoryPage, todayStr } from "../hooks/useProductionHistoryPage"
import { ProductionHistoryTable } from "../components/ProductionHistoryTable"
import { Input } from "@/components/ui/Input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"

export default function ProductionHistoryPage() {
  const {
    data,
    loading,
    page,
    totalItems,
    totalPages,
    pageSize,
    search,
    statusFilter,
    dateField,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    setSearch,
    setStatusFilter,
    handleDateFieldChange,
    setDateFrom,
    setDateTo,
    setSortBy,
    setSortOrder,
    changePage,
    discardProduction,
  } = useProductionHistoryPage()

  function handleDateFromChange(e) {
    setDateFrom(e.target.value)
    changePage(1)
  }

  function handleDateToChange(e) {
    setDateTo(e.target.value)
  }

  const statusOptions = [
    { value: "ALL", label: "Todos los estados" },
    { value: "DONE", label: "Completada" },
    { value: "CANCELLED", label: "Cancelada" },
    { value: "DISCARDED", label: "Descartada" },
  ]

  const handleSearchChange = (v) => { setSearch(v); changePage(1) }
  const handleStatusChange = (v) => { setStatusFilter(v); changePage(1) }
  const handleSortByChange = (v) => { setSortBy(v); changePage(1) }
  const handleSortOrderChange = (v) => { setSortOrder(v); changePage(1) }

  const hasActiveFilters = search !== "" || statusFilter !== "ALL" || dateField !== "" || dateFrom !== ""
  const hasRecords = hasActiveFilters ? true : totalItems > 0 || (data && data.length > 0)

  async function handleDiscard(id, description) {
    await discardProduction(id, {
      description: description?.trim() || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          searchPlaceholder="Buscar producto..."
          onSearchChange={handleSearchChange}
          filters={[
            {
              key: "status",
              placeholder: "Filtrar por estado",
              value: statusFilter,
              onChange: handleStatusChange,
              options: statusOptions,
            },
          ]}
          sortFields={[{ key: "completed_at", label: "Fecha completada" }]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={handleSortByChange}
          onSortOrderChange={handleSortOrderChange}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => {
            setStatusFilter("ALL")
            setDateFrom("")
            setDateTo(todayStr())
            handleDateFieldChange("")
            setSortBy("production_date")
            setSortOrder("desc")
            setSearch("")
            changePage(1)
          }}
        />
      </header>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Filtrar por:</label>
          <Select value={dateField} onValueChange={handleDateFieldChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar criterio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="schedule_date">Fecha programada</SelectItem>
              <SelectItem value="completed_at">Fecha completada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Desde:</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={handleDateFromChange}
            disabled={!dateField}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Hasta:</label>
          <Input
            type="date"
            value={dateTo}
            onChange={handleDateToChange}
            disabled={!dateField}
          />
        </div>
      </div>

      <div className={loading ? "opacity-60 pointer-events-none transition-opacity" : ""}>
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <ProductionHistoryTable
            productions={data}
            hasRecords={hasRecords}
            onDiscard={handleDiscard}
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

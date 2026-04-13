//componentes
import { InputsTable } from "../components/InputsTable";
import { NewInputModal } from "../components/NewInputModal";
import { Notification } from "../components/Notifications";
import { Pagination } from "../components/Pagination";
//componentes genéricos
import { FilterBar } from "@/components/shared/FilterBar";
//hooks
import { useInputsPage } from "../hooks/useInputsPage";
//componentes shadcn
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
//iconos
import { Plus } from "lucide-react";

export default function InputsPage() {
  const {
    filteredData,
    loading,
    search,
    categoryFilter,
    stockFilter,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
    categories,
    stockStatuses,
    setSearch,
    setCategoryFilter,
    setStockFilter,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    openModal,
    setOpenModal,
    notification,
    clearNotification,
    handleCreateInput,
    tableRef,
  } = useInputsPage();

  return (
    <div className="space-y-4">
      <Notification notification={notification} onClose={clearNotification} />

      <header className="flex items-center justify-between gap-4">
        <FilterBar
          // Búsqueda
          search={search}
          searchPlaceholder="Buscar por nombre o marca..."
          onSearchChange={setSearch}
          // Filtros
          filters={[
            {
              key: "category",
              placeholder: "Categoría",
              value: categoryFilter,
              options: categories,
              onChange: setCategoryFilter,
            },
            {
              key: "stock",
              placeholder: "Estado stock",
              value: stockFilter,
              options: stockStatuses,
              onChange: setStockFilter,
            },
          ]}
          // Ordenamiento
          sortFields={[
            { key: "name", label: "Nombre" },
            { key: "stock", label: "Stock" },
          ]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          // Limpiar
          hasActiveFilters={
            search || categoryFilter !== "all" || stockFilter !== "all"
          }
          onClearFilters={() => {
            setSearch("");
            setCategoryFilter("all");
            setStockFilter("all");
          }}
        />
        <Button
          size="sm"
          className="cursor-pointer"
          onClick={() => setOpenModal(true)}
        >
          <Plus />
          Agregar insumo
        </Button>
      </header>
      <NewInputModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateInput}
      />

      <div ref={tableRef}>
        <InputsTable insumos={filteredData?.items || []} />
      </div>

      {filteredData && filteredData.totalCount > 0 && (
        <Pagination
          currentPage={filteredData.currentPage}
          totalPages={filteredData.totalPages}
          onPageChange={setCurrentPage}
          totalCount={filteredData.totalCount}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
}

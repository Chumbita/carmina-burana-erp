//componentes
import { SuppliesTable } from "../components/SuppliesTable";
import { NewSupplyModal } from "../components/NewSupplyModal";
import { NotificationContainer } from "@/components/shared/notifications/NotificationContainer";
import { Pagination } from "../components/Pagination";
//componentes genéricos
import { FilterBar } from "@/components/shared/FilterBar";
//hooks
import { useSuppliesPage } from "../hooks/useSuppliesPage";
//componentes shadcn
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
//iconos
import { Plus } from "lucide-react";

export default function SuppliesPage() {
  const {
    filteredData,
    inputs,
    loading,
    search,
    categoryFilter,
    itemTypeFilter,
    stockFilter,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
    categories,
    itemTypes,
    stockStatuses,
    setSearch,
    setCategoryFilter,
    setItemTypeFilter,
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
  } = useSuppliesPage();

  return (
    <div className="space-y-4">
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
              key: "itemType",
              placeholder: "Tipo",
              value: itemTypeFilter,
              options: itemTypes,
              onChange: setItemTypeFilter,
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
            search || categoryFilter !== "all" || itemTypeFilter !== "all" || stockFilter !== "all"
          }
          onClearFilters={() => {
            setSearch("");
            setCategoryFilter("all");
            setItemTypeFilter("all");
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
      <NewSupplyModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateInput}
        existingInputs={inputs}
      />

      <div ref={tableRef}>
        <SuppliesTable insumos={filteredData?.items || []} />
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

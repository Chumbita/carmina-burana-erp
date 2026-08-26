//componentes
import { SuppliesTable } from "../components/SuppliesTable";
import { NewSupplyModal } from "../components/NewSupplyModal";
//componentes genéricos
import { FilterBar } from "@/components/shared/FilterBar";
import { TablePagination } from "@/components/shared/TablePagination";
//hooks
import { useSuppliesPage } from "../hooks/useSuppliesPage";
//componentes shadcn
import { Button } from "@/components/ui/Button";
//iconos
import { Plus } from "lucide-react";

export default function SuppliesPage() {
  const {
    data,
    loading,
    page,
    totalItems,
    totalPages,
    pageSize,
    search,
    categoryFilter,
    itemTypeFilter,
    stockFilter,
    sortBy,
    sortOrder,
    categories,
    itemTypes,
    stockStatuses,
    setSearch,
    setCategoryFilter,
    setItemTypeFilter,
    setStockFilter,
    setSortBy,
    setSortOrder,
    changePage,
    openModal,
    setOpenModal,
    handleCreateSupply,
    tableRef,
  } = useSuppliesPage();

  const handleSearchChange = (v) => { setSearch(v); changePage(1); };
  const handleCategoryChange = (v) => { setCategoryFilter(v); changePage(1); };
  const handleItemTypeChange = (v) => { setItemTypeFilter(v); changePage(1); };
  const handleStockChange = (v) => { setStockFilter(v); changePage(1); };
  const handleSortByChange = (v) => { setSortBy(v); changePage(1); };
  const handleSortOrderChange = (v) => { setSortOrder(v); changePage(1); };

  const hasActiveFilters = search || categoryFilter !== "all" || itemTypeFilter !== "all" || stockFilter !== "all";
  // hasRecords para DataTable: true si hay algún registro en BD o filtros activos (para distinguir empty vs noResults)
  const hasRecords = hasActiveFilters ? true : totalItems > 0 || (data && data.length > 0);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          searchPlaceholder="Buscar por nombre o marca..."
          onSearchChange={handleSearchChange}
          filters={[
            {
              key: "category",
              placeholder: "Categoría",
              value: categoryFilter,
              options: categories,
              onChange: handleCategoryChange,
            },
            {
              key: "itemType",
              placeholder: "Tipo",
              value: itemTypeFilter,
              options: itemTypes,
              onChange: handleItemTypeChange,
            },
            {
              key: "stock",
              placeholder: "Estado stock",
              value: stockFilter,
              options: stockStatuses,
              onChange: handleStockChange,
            },
          ]}
          sortFields={[
            { key: "name", label: "Nombre" },
            { key: "stock", label: "Stock" },
          ]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={handleSortByChange}
          onSortOrderChange={handleSortOrderChange}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => {
            setSearch("");
            setCategoryFilter("all");
            setItemTypeFilter("all");
            setStockFilter("all");
            changePage(1);
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
        onSubmit={handleCreateSupply}
      />

      <div ref={tableRef} className={loading ? "opacity-60 pointer-events-none transition-opacity" : ""}>
        <SuppliesTable insumos={data} loading={loading} page={page} pageSize={pageSize} hasRecords={hasRecords} />
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
  );
}

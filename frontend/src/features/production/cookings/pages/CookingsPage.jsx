import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/shared/FilterBar";
import { Pagination } from "@/features/Inventario/gestion_insumos/components/Pagination";
import { Plus } from "lucide-react";
import { useCookingsPage } from "../hooks/useCookingsPage";
import { CookingsTable } from "../components/CookingsTable";
import { NewCookingModal } from "../components/NewCookingModal";

export default function CookingsPage() {
  const {
    cookings,
    search,
    statusFilter,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
    totalCount,
    totalPages,
    statusOptions,
    setSearch,
    setStatusFilter,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    openModal,
    setOpenModal,
    handleCreateCooking,
  } = useCookingsPage();

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          searchPlaceholder="Buscar por nombre, receta o lote..."
          onSearchChange={setSearch}
          filters={[
            {
              key: "status",
              placeholder: "Estado",
              value: statusFilter,
              options: statusOptions,
              onChange: setStatusFilter,
            },
          ]}
          sortFields={[
            { key: "name", label: "Nombre" },
            { key: "date", label: "Fecha" },
            { key: "status", label: "Estado" },
          ]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          hasActiveFilters={search || statusFilter !== "all"}
          onClearFilters={() => {
            setSearch("");
            setStatusFilter("all");
          }}
        />

        <Button
          size="sm"
          className="cursor-pointer"
          onClick={() => setOpenModal(true)}
        >
          <Plus />
          Agregar cocción
        </Button>
      </header>

      <NewCookingModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateCooking}
      />

      <CookingsTable cookings={cookings} />

      {totalCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
}

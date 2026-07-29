import { NewProductionModal } from "../components/NewProductionModal";
import { NotificationContainer } from "@/components/shared/notifications/NotificationContainer";
import { FilterBar } from "@/components/shared/FilterBar";
import { useProductionsPage } from "../hooks/useProductionsPage";
import { useProductionFilters } from "../hooks/useProductionPageFilter";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { ProductionTable } from "../components/ProductionTable";

export default function ProductionPage() {
  const {
    productions,
    releaseProduction,
    startProduction,
    completeProduction,
    loading,
    openModal,
    setOpenModal,
    handleCreateProduction,
    tableRef,
  } = useProductionsPage();
  const {
    statusFilter,
    sortBy,
    sortOrder,
    setStatusFilter,
    setSortBy,
    setSortOrder,
    filteredProductions,
  } = useProductionFilters();

  const displayData = filteredProductions(productions);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={""}
          searchPlaceholder="Buscar..."
          onSearchChange={() => {}}
          filters={[
            {
              key: "status",
              placeholder: "Filtrar por estado",
              value: statusFilter,
              onChange: (value) => setStatusFilter(value),
              options: [
                { label: "Todos los estados", value: "ALL" },
                { label: "Planeada", value: "PLANNED" },
                { label: "Liberada", value: "RELEASED" },
                { label: "En Proceso", value: "IN_PROGRESS" },
              ],
            },
          ]}
          sortFields={[{ key: "schedule_date", label: "Fecha Planeada" }]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          hasActiveFilters={statusFilter !== "ALL" || sortBy !== ""}
          onClearFilters={() => {
            setStatusFilter("ALL");
            setSortBy("");
            setSortOrder("asc");
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
        onSubmit={handleCreateProduction}
      />

      <div ref={tableRef}>
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <ProductionTable
            productions={displayData}
            onRelease={releaseProduction}
            onStart={startProduction}
            onComplete={completeProduction}
          />
        )}
      </div>

      <NotificationContainer />
    </div>
  );
}

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
    handlePlanProduction,
    handleExecuteProduction,
    cancelProduction,
    loading,
    openModal,
    setOpenModal,
    tableRef,
  } = useProductionsPage();
  const {
    sortBy,
    sortOrder,
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
          sortFields={[{ key: "schedule_date", label: "Fecha Programada" }]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          hasActiveFilters={sortBy !== ""}
          onClearFilters={() => {
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
        onSubmit={handlePlanProduction}
      />

      <div ref={tableRef}>
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <ProductionTable
            productions={displayData}
            onExecute={handleExecuteProduction}
            onCancel={cancelProduction}
          />
        )}
      </div>

      <NotificationContainer />
    </div>
  );
}

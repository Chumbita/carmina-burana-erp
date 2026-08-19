import { NewProductionModal } from "../components/NewProductionModal";
import { NotificationContainer } from "@/components/shared/notifications/NotificationContainer";
import { FilterBar } from "@/components/shared/FilterBar";
import { useProductionsPage } from "../hooks/useProductionsPage";
import { useProductionFilters } from "../hooks/useProductionPageFilter";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { ProductionTable } from "../components/ProductionTable";

export default function ProductionRegisterPage() {
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
    search,
    setSortBy,
    setSortOrder,
    setSearch,
    filteredProductions,
  } = useProductionFilters();

  const displayData = filteredProductions(productions);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          searchPlaceholder="Buscar producto..."
          onSearchChange={setSearch}
          sortFields={[{ key: "schedule_date", label: "Fecha Programada" }]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          hasActiveFilters={sortBy !== "" || search !== ""}
          onClearFilters={() => {
            setSortBy("");
            setSortOrder("asc");
            setSearch("");
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

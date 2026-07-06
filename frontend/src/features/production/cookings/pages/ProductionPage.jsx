import { NewProductionModal } from "../components/NewProductionModal";
import { NotificationContainer } from "@/components/shared/notifications/NotificationContainer";
import { FilterBar } from "@/components/shared/FilterBar";
import { useProductionsPage } from "../hooks/useProductionsPage";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { ProductionTable } from "../components/ProductionTable";

export default function ProductionPage() {
  const {
    productions,
    loading,
    openModal,
    setOpenModal,
    handleCreateProduction,
    tableRef,
  } = useProductionsPage();

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={""}
          searchPlaceholder="Buscar..."
          onSearchChange={() => {}}
          filters={[]}
          sortFields={[]}
          sortBy={undefined}
          sortOrder={undefined}
          onSortByChange={() => {}}
          onSortOrderChange={() => {}}
          hasActiveFilters={false}
          onClearFilters={() => {}}
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
        ) : productions.length === 0 ? (
          <div className="text-muted">No hay órdenes de producción.</div>
        ) : (
          <ProductionTable productions={productions} />
        )}
      </div>

      <NotificationContainer />
    </div>
  );
}

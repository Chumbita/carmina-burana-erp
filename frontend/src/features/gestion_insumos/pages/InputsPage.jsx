//componentes
import { InputsTable } from "../components/InputsTable";
import { FilterBar } from "../components/FilterBar";
import { NewInputModal } from "../components/NewInputModal";
import { Notification } from "../components/Notifications";
import { DataTable } from "../../../components/shared/DataTable"
//hooks
import { useInputsPage } from "../hooks/useInputsPage";
//componentes shadcn
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
//iconos
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge"
import { estadoStyles } from "../utils/stockStyles"

const tableHeaders = [
  { header: "Nro", accessor: "id" },
  { header: "Nombre", accessor: "name" },
  { header: "Marca", accessor: "brand" },
  { header: "Categoria", accessor: "category" },
  { header: "Stock", accessor: "stockTotal" },
  { header: "Estado", accessor: "estadoStock",
    render: (value) => (
      <Badge variant="outline" className={estadoStyles[value]}>
        {value}
      </Badge>
    ),
  },
];
export default function InputsPage() {
  const {
    filteredInputs,
    loading,
    search,
    categoryFilter,
    categories,
    setSearch,
    setCategoryFilter,
    openModal,
    setOpenModal,
    notification,
    clearNotification,
    handleCreateInput,
    tableRef,
  } = useInputsPage();

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-4">
      <Notification notification={notification} onClose={clearNotification} />

      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          categoryFilter={categoryFilter}
          stockFilter={stockFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          categories={categories}
          stockStatuses={stockStatuses}
          onSearchChange={setSearch}
          onCategoryChange={setCategoryFilter}
          onStockChange={setStockFilter}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
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

      {filteredData.totalCount === 0 ? (
        <p className="text-center py-8 text-gray-500">
          {search || categoryFilter !== "todas"
            ? "No se encontraron insumos"
            : "No hay insumos registrados"}
        </p>
      ) : (
        <div ref={tableRef}>
          <DataTable columns={tableHeaders} data={filteredInputs} />
        </div>
      )}
    </div>
  );
}

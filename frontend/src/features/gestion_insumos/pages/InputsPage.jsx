//componentes 
import { InputsTable } from "../components/InputsTable"
import { FilterBar } from "../components/FilterBar"
import { NewInputModal } from "../components/NewInputModal"
import { Notification } from "../components/Notifications"
//hooks
import { useInputsPage } from "../hooks/useInputsPage"
//componentes shadcn
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
//iconos
import { Plus } from "lucide-react"

export default function InputsPage() {
  const {
    filteredInputs, loading,
    search, categoriaFilter, categorias, setSearch, setCategoriaFilter,
    openModal, setOpenModal,
    notification, clearNotification,
    handleCreateInput,
    tableRef,
  } = useInputsPage()

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="space-y-4">
      <Notification notification={notification} onClose={clearNotification} />

      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          categoriaFilter={categoriaFilter}
          categorias={categorias}
          onSearchChange={setSearch}
          onCategoriaChange={setCategoriaFilter}
        />
        <Button size="sm" className="cursor-pointer" onClick={() => setOpenModal(true)}>
          <Plus />Agregar insumo
        </Button>
      </header>

      <NewInputModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateInput}
      />

      {filteredInputs.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          {search || categoriaFilter !== "todas" ? "No se encontraron insumos" : "No hay insumos registrados"}
        </p>
      ) : (
        <div ref={tableRef}>
          <InputsTable insumos={filteredInputs} />
        </div>
      )}
    </div>
  )
}
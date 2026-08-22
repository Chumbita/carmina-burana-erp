import { Plus } from 'lucide-react'

import { FilterBar } from '@/components/shared/FilterBar'
import { Button } from '@/components/ui/Button'
import { SupplierForm } from '../components/SupplierForm'
import { SuppliersTable } from '../components/SuppliersTable'
import { useSuppliersPage } from '../hooks/useSuppliersPage'

export default function SuppliersPage() {
  const {
    emptySupplier,
    editingSupplier,
    filteredSuppliers,
    hasSuppliers,
    loading,
    openForm,
    saving,
    search,
    statusFilter,
    saveSupplier,
    setOpenForm,
    setSearch,
    setStatusFilter,
    startCreate,
  } = useSuppliersPage()

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          searchPlaceholder="Buscar por nombre, email o teléfono..."
          onSearchChange={setSearch}
          filters={[
            {
              key: 'status',
              placeholder: 'Estado',
              value: statusFilter,
              options: [
                { label: 'Activos', value: 'ACTIVE' },
                { label: 'Inactivos', value: 'INACTIVE' },
                { label: 'Todos', value: 'all' },
              ],
              onChange: setStatusFilter,
            },
          ]}
          hasActiveFilters={search || statusFilter !== 'ACTIVE'}
          onClearFilters={() => {
            setSearch('')
            setStatusFilter('ACTIVE')
          }}
        />
        <Button size="sm" className="cursor-pointer" onClick={startCreate}>
          <Plus />
          Agregar proveedor
        </Button>
      </header>

      <SupplierForm
        open={openForm}
        onOpenChange={setOpenForm}
        supplier={editingSupplier}
        emptySupplier={emptySupplier}
        saving={saving}
        onSubmit={saveSupplier}
      />

      <SuppliersTable
        suppliers={filteredSuppliers}
        hasRecords={hasSuppliers}
        loading={loading}
      />
    </div>
  )
}

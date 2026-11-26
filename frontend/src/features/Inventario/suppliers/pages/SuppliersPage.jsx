import { Plus } from 'lucide-react'

import { FilterBar } from '@/components/shared/FilterBar'
import { TablePagination } from '@/components/shared/TablePagination'
import { Button } from '@/components/ui/Button'
import { SupplierForm } from '../components/SupplierForm'
import { SuppliersTable } from '../components/SuppliersTable'
import { emptySupplier } from '../dto/supplier.dto'
import { useSuppliersPage } from '../hooks/useSuppliersPage'

const STATUS_OPTIONS = [
  { label: 'Activos', value: 'ACTIVE' },
  { label: 'Inactivos', value: 'INACTIVE' },
  { label: 'Todos', value: 'all' },
]

export default function SuppliersPage() {
  const {
    data,
    editingSupplier,
    hasActiveFilters,
    hasRecords,
    loading,
    openForm,
    page,
    pageSize,
    saving,
    search,
    statusFilter,
    totalItems,
    totalPages,
    changePage,
    changeSearch,
    changeStatus,
    clearFilters,
    saveSupplier,
    setOpenForm,
    startCreate,
  } = useSuppliersPage()

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          searchPlaceholder="Buscar por nombre, email o teléfono..."
          onSearchChange={changeSearch}
          filters={[
            {
              key: 'status',
              placeholder: 'Estado',
              value: statusFilter,
              options: STATUS_OPTIONS,
              onChange: changeStatus,
            },
          ]}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
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

      <div className={loading ? 'opacity-60 pointer-events-none transition-opacity' : ''}>
        <SuppliersTable
          suppliers={data}
          hasRecords={hasRecords}
          loading={loading}
          page={page}
          pageSize={pageSize}
        />
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
  )
}

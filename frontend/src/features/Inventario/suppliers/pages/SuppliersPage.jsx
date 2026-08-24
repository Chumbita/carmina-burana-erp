import { Plus } from 'lucide-react'

import { FilterBar } from '@/components/shared/FilterBar'
import { TablePagination } from '@/components/shared/TablePagination'
import { Button } from '@/components/ui/Button'
import { SupplierForm } from '../components/SupplierForm'
import { SuppliersTable } from '../components/SuppliersTable'
import { useSuppliersPage } from '../hooks/useSuppliersPage'

export default function SuppliersPage() {
  const {
    emptySupplier,
    editingSupplier,
    data,
    hasRecords,
    loading,
    page,
    totalItems,
    totalPages,
    pageSize,
    openForm,
    saving,
    search,
    statusFilter,
    saveSupplier,
    setOpenForm,
    setSearch,
    setStatusFilter,
    changePage,
    startCreate,
  } = useSuppliersPage()

  const handleSearchChange = (v) => {
    setSearch(v)
    changePage(1)
  }

  const handleStatusChange = (v) => {
    setStatusFilter(v)
    changePage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('ACTIVE')
    changePage(1)
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          searchPlaceholder="Buscar por nombre, email o teléfono..."
          onSearchChange={handleSearchChange}
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
              onChange: handleStatusChange,
            },
          ]}
          hasActiveFilters={search || statusFilter !== 'ACTIVE'}
          onClearFilters={handleClearFilters}
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

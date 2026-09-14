import { Plus } from 'lucide-react'

import { FilterBar } from '@/components/shared/FilterBar'
import { TablePagination } from '@/components/shared/TablePagination'
import { Button } from '@/components/ui/Button'
import { BrandForm } from '../components/BrandForm'
import { BrandsTable } from '../components/BrandsTable'
import { useBrandsPage } from '../hooks/useBrandsPage'

export default function BrandsPage() {
  const {
    emptyBrand,
    filteredBrands,
    hasBrands,
    loading,
    openForm,
    saving,
    search,
    page,
    pageSize,
    totalItems,
    totalPages,
    changePage,
    saveBrand,
    setOpenForm,
    setSearch,
    startCreate,
  } = useBrandsPage()

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          searchPlaceholder="Buscar por nombre..."
          onSearchChange={setSearch}
          filters={[]}
          hasActiveFilters={search}
          onClearFilters={() => {
            setSearch('')
          }}
        />
        <Button size="sm" className="cursor-pointer" onClick={startCreate}>
          <Plus />
          Agregar marca
        </Button>
      </header>

      <BrandForm
        open={openForm}
        onOpenChange={setOpenForm}
        emptyBrand={emptyBrand}
        saving={saving}
        onSubmit={saveBrand}
      />

      <BrandsTable
        brands={filteredBrands}
        hasRecords={hasBrands}
        loading={loading}
        page={page}
        pageSize={pageSize}
      />

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

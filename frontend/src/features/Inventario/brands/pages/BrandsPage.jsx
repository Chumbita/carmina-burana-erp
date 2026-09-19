import { Plus } from 'lucide-react'

import { FilterBar } from '@/components/shared/FilterBar'
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
    saveBrand,
    setOpenForm,
    setSearch,
    startCreate,
  } = useBrandsPage()

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        <Button size="sm" className="w-full cursor-pointer sm:w-auto" onClick={startCreate}>
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

      <BrandsTable brands={filteredBrands} hasRecords={hasBrands} loading={loading} />
    </div>
  )
}

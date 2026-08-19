import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Button } from '@/components/ui/Button'
import { Plus } from "lucide-react"
import { TablePagination } from '@/components/shared/TablePagination'

// Componentes existentes
import { SupplyEntryForm } from '../components/SupplyEntryForm'
import { SupplyEntryFilters } from '../components/SupplyEntryFilters'
import { SupplyEntryTable } from '../components/SupplyEntryTable'

// Hooks
import { useSupplyEntryForm } from '../hooks/useSupplyEntryForm'
import { useSupplyEntryPage } from '../hooks/useSupplyEntryPage'
import { useSuppliers as useSupplyEntrySuppliers } from '../hooks/useSuppliers'
import { useSupplies } from '../../gestion_insumos/hooks/useSupplies'

// Constants
import { ITEMS_PER_PAGE } from '../constants/supplyEntry.constants'

/**
 * SupplyEntryPage - Main page for supply entry management
 * Following the same pattern as SuppliesPage
 */
export default function SupplyEntryPage() {
  // Main page hook
  const {
    data,
    loading,
    search,
    dateFrom,
    dateTo,
    supplierFilter,
    page,
    totalItems,
    totalPages,
    openModal,
    setSearch,
    setDateFrom,
    setDateTo,
    setSupplierFilter,
    setOpenModal,
    changePage,
    handleCreateSupplyEntry,
  } = useSupplyEntryPage()

  // Form hook for modal
  const { supplies } = useSupplies()
  const {
    suppliers: supplierOptions,
    loading: suppliersLoading,
    createSupplier,
  } = useSupplyEntrySuppliers()
  const formHook = useSupplyEntryForm(supplies, handleCreateSupplyEntry)

  const resetPage = () => changePage(1)

  return (
    <div className="space-y-4">
      {/* Header with filters and actions */}
      <header className="flex items-center justify-between gap-4">
        <SupplyEntryFilters
          filters={{
            searchTerm: search,
            dateFrom,
            dateTo,
            selectedSupplier: supplierFilter
          }}
          updateFilter={(key, value) => {
            if (key === 'searchTerm') setSearch(value)
            else if (key === 'dateFrom') setDateFrom(value)
            else if (key === 'dateTo') setDateTo(value)
            else if (key === 'selectedSupplier') setSupplierFilter(value)
            resetPage()
          }}
          clearFilters={() => {
            setSearch('')
            setDateFrom('')
            setDateTo('')
            setSupplierFilter('all')
            resetPage()
          }}
          supplierOptions={supplierOptions}
        />

        <Button
          size="sm"
          className="cursor-pointer"
          onClick={() => {
            formHook.handleReset()
            setOpenModal(true)
          }}
        >
          <Plus />Nuevo Abastecimiento
        </Button>
      </header>

      {/* Table */}
      <SupplyEntryTable
        entries={data}
        loading={loading}
      />

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex justify-center">
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={ITEMS_PER_PAGE}
            onChangePage={changePage}
          />
        </div>
      )}

      {/* Empty state */}
      {totalItems === 0 && !loading && (
        <p className="text-center py-8 text-gray-500">
          {search || dateFrom || dateTo || supplierFilter !== 'all'
            ? "No se encontraron abastecimientos"
            : "No hay abastecimientos registrados"
          }
        </p>
      )}

      {/* Modal for new supply entry */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="!w-[75vw] !max-w-[75vw] !sm:max-w-[75vw] max-h-[90vh] overflow-y-auto p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl">Nuevo Abastecimiento</DialogTitle>
          </DialogHeader>

          <SupplyEntryForm
            formHook={formHook}
            availableSupplies={supplies}
            supplierOptions={supplierOptions}
            suppliersLoading={suppliersLoading}
            onCreateSupplier={createSupplier}
            layout="modal"
            onCancel={() => setOpenModal(false)}
            isSubmitting={formHook.loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

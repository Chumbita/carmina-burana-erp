import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Plus } from "lucide-react"

// Componentes existentes
import { SupplyEntryForm } from '../components/SupplyEntryForm'
import { SupplyEntryFilters } from '../components/SupplyEntryFilters'
import { SupplyEntryTable } from '../components/SupplyEntryTable'

// Hooks
import { useSupplyEntryForm } from '../hooks/useSupplyEntryForm'
import { useSupplyEntryPage } from '../hooks/useSupplyEntryPage'
import { useInputs } from '../../gestion_insumos/hooks/useInputs'

/**
 * InputEntryPage - Main page for supply entry management
 * Following the same pattern as InputsPage
 */
export default function InputEntryPage() {
  // Main page hook
  const {
    filteredData,
    loading,
    error,
    search,
    dateFrom,
    dateTo,
    supplierFilter,
    sortBy,
    sortOrder,
    suppliers,
    currentPage,
    itemsPerPage,
    openModal,
    setSearch,
    setDateFrom,
    setDateTo,
    setSupplierFilter,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setOpenModal,
    handleCreateSupplyEntry,
  } = useSupplyEntryPage()

  // Form hook for modal
  const { inputs } = useInputs()
  const formHook = useSupplyEntryForm(inputs, handleCreateSupplyEntry)

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

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
          }}
          clearFilters={() => {
            setSearch('')
            setDateFrom('')
            setDateTo('')
            setSupplierFilter('all')
          }}
          uniqueSuppliers={suppliers}
        />
        
        <Button size="sm" className="cursor-pointer" onClick={() => setOpenModal(true)}>
          <Plus />Nuevo Abastecimiento
        </Button>
      </header>

      {/* Table */}
      <SupplyEntryTable
        entries={filteredData.items}
        loading={loading}
      />

      {/* Results summary */}
      {filteredData.totalCount > 0 && (
        <div className="flex justify-center">
          <span className="text-sm text-gray-600">
            Página {filteredData.currentPage} de {filteredData.totalPages} • 
            {filteredData.totalCount} registros totales
          </span>
        </div>
      )}

      {/* Empty state */}
      {filteredData.totalCount === 0 && (
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
            availableInputs={inputs}
            layout="modal"
            onCancel={() => setOpenModal(false)}
            isSubmitting={formHook.loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

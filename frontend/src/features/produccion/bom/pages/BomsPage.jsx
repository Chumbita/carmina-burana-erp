import { useState } from 'react'
import { BomsTable } from "../components/BomsTable"
import { NewBomModal } from "../components/NewBomModal"
import { useBoms } from "../hooks/useBoms"
import { useBomFilters } from "../hooks/useBomFilters"
import { bomService } from "../services/bomService"

import { FilterBar } from "@/components/shared/FilterBar"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
import { Plus } from "lucide-react"

export default function BomsPage() {
  const [openModal, setOpenModal] = useState(false)
  const { boms, loading, error, getBoms } = useBoms()
  const {
    search,
    hasActiveFilters,
    handleSearchChange,
    clearFilters,
    filteredBoms,
  } = useBomFilters()

  const filteredData = filteredBoms(boms)

  async function handleCreateBom(data) {
    await bomService.create(data)
    await getBoms()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive py-8">
        Error al cargar las fórmulas: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          searchPlaceholder="Buscar por producto..."
          onSearchChange={handleSearchChange}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
        <Button
          size="sm"
          className="cursor-pointer"
          onClick={() => setOpenModal(true)}
        >
          <Plus />
          Nueva Fórmula
        </Button>
      </header>
      <div>
        <BomsTable boms={filteredData.items} />
      </div>

      <NewBomModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateBom}
      />
    </div>
  )
}

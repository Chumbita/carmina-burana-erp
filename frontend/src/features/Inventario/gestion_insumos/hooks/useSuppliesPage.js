import { useRef, useState } from "react"
import { useSupplies } from "./useSupplies"
import { useSupplyFilters } from "./useFiltersSupplies"
import { useNotification } from "@/components/shared/notifications/useNotification"
import { useLocationNotification } from "./useLocationNotification"
// Hook orquestador de la página de insumos.
// Compone useSupplies, useSupplyFilters y useNotification en un único punto de entrada,
// manteniendo la page limpia de lógica y centrada solo en el renderizado.

export function useSuppliesPage() {
  const { supplies, loading, error, createSupply } = useSupplies()
  const { search, categoryFilter, stockFilter, sortBy, sortOrder, currentPage, itemsPerPage, categories, stockStatuses, setSearch, setCategoryFilter, setStockFilter, setSortBy, setSortOrder, setCurrentPage, filteredSupplies } = useSupplyFilters()
  const notify = useNotification()
  
  useLocationNotification(notify)

  const [openModal, setOpenModal] = useState(false)
  const tableRef = useRef(null)

  async function handleCreateSupply(formData) {
    try {
      const payload = {
        name:            formData.name,
        brand_id:        formData.brand_id,
        base_uom_id:     formData.base_uom_id,
        min_stock_level: formData.min_stock_level ?? 0,
        supply_category: formData.supply_category,
      }
      const newSupply = await createSupply(payload)
      setOpenModal(false)
      notify.success(`Insumo "${newSupply.name}" creado exitosamente`, {
        onClick: () => handleNotificationClick(newSupply.id)
      })
    } catch (error) {
      notify.error(`Error al crear el insumo: ${error.message || 'Error desconocido'}`)
    }
  }

  function handleNotificationClick(id) {
    if (id && tableRef.current) {
      const row = tableRef.current.querySelector(`[data-insumo-id="${id}"]`)
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' })
        row.classList.add('bg-green-100', 'dark:bg-green-900')
        setTimeout(() => row.classList.remove('bg-green-100', 'dark:bg-green-900'), 2000)
      }
    }
  }

  // Calcular datos filtrados con paginación
  const filteredData = filteredSupplies(supplies)

  return {
    // datos
    supplies,
    loading,
    error,
    filteredData,
    // filtros
    search,
    categoryFilter,
    stockFilter,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
    categories,
    stockStatuses,
    setSearch,
    setCategoryFilter,
    setStockFilter,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    // modal
    openModal,
    setOpenModal,
    // handlers
    handleCreateSupply,
    // ref
    tableRef,
  }
}

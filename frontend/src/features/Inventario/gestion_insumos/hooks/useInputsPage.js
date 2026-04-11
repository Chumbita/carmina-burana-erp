import { useRef, useState } from "react"
import { useInputs } from "./useInputs"
import { useInputFilters } from "./useFiltersInputs"
import { useNotification } from "@/components/shared/notifications/useNotification"
import { useLocationNotification } from "./useLocationNotification"
// Hook orquestador de la página de insumos.
// Compone useInputs, useInputFilters y useNotification en un único punto de entrada,
// manteniendo la page limpia de lógica y centrada solo en el renderizado.
// maneja funciones especificas de InputsPage: el proceso de crear un insumo y
//navegar hacia él haciendo click en la notificacion 

export function useInputsPage() {
  const { inputs, loading, error, createInput } = useInputs()
  const { search, categoryFilter, stockFilter, sortBy, sortOrder, currentPage, itemsPerPage, categories, stockStatuses, setSearch, setCategoryFilter, setStockFilter, setSortBy, setSortOrder, setCurrentPage, filteredInputs } = useInputFilters()
  const notify = useNotification()
  
  useLocationNotification(notify)

  const [openModal, setOpenModal] = useState(false)
  const tableRef = useRef(null)

  async function handleCreateInput(inputData) {
    try {
      const newInput = await createInput(inputData)
      setOpenModal(false)
      notify.success(`Insumo "${newInput.name}" creado exitosamente`, {
        onClick: () => handleNotificationClick(newInput.id)
      })
    } catch (error) {
      notify.error(`Error al crear el insumo: ${error.message}` || 'Error al crear el insumo')
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
  const filteredData = filteredInputs(inputs)

  return {
    // datos
    inputs,
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
    handleCreateInput,
    // ref
    tableRef,
  }
}
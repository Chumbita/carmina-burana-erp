import { useCallback, useEffect, useRef, useState } from "react"
import { supplyService } from "../services/supplyService"
import { useNotification } from "@/components/shared/notifications/useNotification"
import { useLocationNotification } from "./useLocationNotification"
import { useSupplyFilters } from "./useSupplyFilters"
import { useCreateSupply } from "./useCreateSupply"
import { highlightTableRow } from "../utils/highlightTableRow"

const PAGE_SIZE = 20

/**
 * Orquestador de la página de insumos: paginación server-side + filtros
 * (useSupplyFilters) + alta (useCreateSupply).
 */
export function useSuppliesPage() {
  const notify = useNotification()
  useLocationNotification(notify)

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const tableRef = useRef(null)

  const filters = useSupplyFilters()
  const { query } = filters

  const fetchSupplies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await supplyService.getAll({ page, pageSize: PAGE_SIZE, ...query })
      setData(res.data || [])
      setTotalItems(res.pagination?.total_items ?? 0)
      setTotalPages(res.pagination?.total_pages ?? 0)
    } catch (err) {
      setError(err)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, query])

  // fetch principal + refreshKey para forzar recarga post-create
  useEffect(() => {
    fetchSupplies()
  }, [fetchSupplies, refreshKey])

  const refresh = useCallback(() => {
    setPage(1)
    setRefreshKey((k) => k + 1)
  }, [])

  const changePage = useCallback((next) => setPage(next), [])

  const { createItem } = useCreateSupply({
    onCreated: () => {
      setOpenModal(false)
      refresh()
    },
    onHighlight: (id) => highlightTableRow(tableRef.current, id),
  })

  // Cualquier cambio de filtro vuelve a la primera página
  const changeFilter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  function clearFilters() {
    filters.resetFilters()
    setPage(1)
  }

  return {
    data,
    loading,
    error,
    page,
    pageSize: PAGE_SIZE,
    totalItems,
    totalPages,
    changePage,
    refresh,
    filters,
    hasActiveFilters: filters.hasActiveFilters,
    changeSearch: changeFilter(filters.setSearch),
    changeCategory: changeFilter(filters.setCategory),
    changeItemType: changeFilter(filters.setItemType),
    changeStock: changeFilter(filters.setStock),
    changeSortBy: changeFilter(filters.setSortBy),
    changeSortOrder: changeFilter(filters.setSortOrder),
    clearFilters,
    openModal,
    setOpenModal,
    handleCreateSupply: createItem,
    tableRef,
  }
}

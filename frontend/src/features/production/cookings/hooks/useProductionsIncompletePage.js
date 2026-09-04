import { useCallback, useEffect, useRef, useState } from "react"
import { productionService } from "../services/productionService"
import { useNotification } from "@/components/shared/notifications/useNotification"
import { useLocationNotification } from "@/features/Inventario/gestion_insumos/hooks/useLocationNotification"

const PAGE_SIZE = 20

export function useProductionsIncompletePage() {
  const notify = useNotification()
  useLocationNotification(notify)

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sortBy, setSortBy] = useState("schedule_date")
  const [sortOrder, setSortOrder] = useState("asc")

  const [openModal, setOpenModal] = useState(false)
  const tableRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchProductions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await productionService.getIncomplete({
        page,
        pageSize: PAGE_SIZE,
        q: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      })
      setData(res.data || [])
      setTotalItems(res.pagination?.total_items ?? 0)
      setTotalPages(res.pagination?.total_pages ?? 0)
    } catch (err) {
      setError(err)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, sortBy, sortOrder])

  useEffect(() => {
    fetchProductions()
  }, [fetchProductions, refreshKey])

  const refresh = useCallback(() => {
    setPage(1)
    setRefreshKey((k) => k + 1)
  }, [])

  const changePage = useCallback((next) => setPage(next), [])

  async function handlePlanProduction(formData) {
    const payload = {
      item_id: formData.item_id,
      bom_id: formData.bom_id,
      planned_quantity: formData.planned_quantity,
      schedule_date: formData.schedule_date || undefined,
      description: formData.description || undefined,
    }
    const created = await productionService.plan(payload)
    refresh()
    notify.success("Orden de producción planificada", {
      onClick: () => handleNotificationClick(created.id),
    })
    setOpenModal(false)
    return created
  }

  async function handleExecuteProduction(order, producedData) {
    return productionService.execute(order.id, producedData)
  }

  async function cancelProduction(id) {
    return productionService.cancel(id)
  }

  function handleNotificationClick(id) {
    if (id && tableRef.current) {
      const row = tableRef.current.querySelector(`[data-production-id="${id}"]`)
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" })
        row.classList.add("bg-green-100", "dark:bg-green-900")
        setTimeout(() => row.classList.remove("bg-green-100", "dark:bg-green-900"), 2000)
      }
    }
  }

  return {
    data,
    loading,
    error,
    page,
    totalItems,
    totalPages,
    pageSize: PAGE_SIZE,
    search,
    sortBy,
    sortOrder,
    setSearch,
    setSortBy,
    setSortOrder,
    changePage,
    refresh,
    openModal,
    setOpenModal,
    handlePlanProduction,
    handleExecuteProduction,
    cancelProduction,
    tableRef,
  }
}
